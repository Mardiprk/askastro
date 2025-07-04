import { NextResponse } from 'next/server';
import { CREDIT_PACKAGES } from '@/app/lib/constants';
import { prisma } from '@/app/lib/prisma';
import { db } from '@/app/lib/db';

// PayPal webhook ID for verification
const WEBHOOK_ID = '9PD853795H520392P';

// Function to get an access token from PayPal
async function getPayPalAccessToken(clientId: string, clientSecret: string, apiUrl: string) {
  try {
    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    const response = await fetch(`${apiUrl}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${auth}`
      },
      body: 'grant_type=client_credentials'
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(`Failed to get PayPal access token: ${data.error_description}`);
    }
    
    return data.access_token;
  } catch (error) {
    console.error('Error getting PayPal access token:', error);
    throw error;
  }
}

// Function to verify a PayPal order
async function verifyPayPalOrder(orderId: string, accessToken: string, apiUrl: string) {
  try {
    const response = await fetch(`${apiUrl}/v2/checkout/orders/${orderId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      }
    });

    const orderData = await response.json();
    if (!response.ok) {
      throw new Error(`Failed to verify PayPal order: ${orderData.message}`);
    }

    // Check if the order is completed
    const isCompleted = orderData.status === 'COMPLETED';
    
    // If order is not completed but approved, we can capture it
    if (!isCompleted && orderData.status === 'APPROVED') {
      const captureResponse = await fetch(`${apiUrl}/v2/checkout/orders/${orderId}/capture`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        }
      });
      
      const captureData = await captureResponse.json();
      if (!captureResponse.ok) {
        throw new Error(`Failed to capture PayPal payment: ${captureData.message}`);
      }
      
      return captureData;
    }
    
    return orderData;
  } catch (error) {
    console.error('Error verifying PayPal order:', error);
    throw error;
  }
}

// Function to verify webhook signature
async function verifyWebhookSignature(
  event: any,
  headers: Headers,
  accessToken: string,
  webhookId: string,
  apiUrl: string
) {
  try {
    const response = await fetch(`${apiUrl}/v1/notifications/verify-webhook-signature`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        webhook_id: webhookId,
        event_type: event.event_type,
        transmission_id: headers.get('paypal-transmission-id'),
        transmission_time: headers.get('paypal-transmission-time'),
        cert_url: headers.get('paypal-cert-url'),
        auth_algo: headers.get('paypal-auth-algo'),
        transmission_sig: headers.get('paypal-transmission-sig'),
        webhook_event: event
      })
    });

    const data = await response.json();
    return data.verification_status === 'SUCCESS';
  } catch (error) {
    console.error('Error verifying webhook signature:', error);
    return false;
  }
}

export async function POST(req: Request) {
  // Get PayPal configuration
  const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
  const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;
  const PAYPAL_API_URL = process.env.NODE_ENV === 'production' 
    ? 'https://api-m.paypal.com' 
    : 'https://api-m.sandbox.paypal.com';

  if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
    console.error('Missing required PayPal environment variables');
    return new NextResponse('Server configuration error', { status: 500 });
  }

  try {
    // Check if this is a webhook notification from PayPal
    const isWebhook = req.headers.get('paypal-transmission-id') !== null;

    if (isWebhook) {
      // Handle webhook event
      const event = await req.json();
      const accessToken = await getPayPalAccessToken(
        PAYPAL_CLIENT_ID, 
        PAYPAL_CLIENT_SECRET,
        PAYPAL_API_URL
      );

      // Verify webhook signature
      const isVerified = await verifyWebhookSignature(
        event,
        req.headers,
        accessToken,
        WEBHOOK_ID,
        PAYPAL_API_URL
      );

      if (!isVerified) {
        console.error('Invalid webhook signature');
        return new NextResponse('Invalid signature', { status: 401 });
      }

      // Process webhook event
      if (event.event_type === 'PAYMENT.CAPTURE.COMPLETED') {
        const orderID = event.resource.supplementary_data?.related_ids?.order_id;
        if (!orderID) {
          console.error('Missing order ID in webhook event');
          return new NextResponse('Missing order ID', { status: 400 });
        }

        // Verify the payment and update user credits
        const orderData = await verifyPayPalOrder(orderID, accessToken, PAYPAL_API_URL);
        
        // Verify the payment amount matches the package price
        const paymentAmount = parseFloat(
          orderData.purchase_units?.[0]?.payments?.captures?.[0]?.amount?.value ||
            orderData.purchase_units?.[0]?.amount?.value
        );
        
        const package_details = CREDIT_PACKAGES.find(pkg => pkg.paypalProductId === event.resource.id);
        
        if (!package_details) {
          console.error('Invalid product ID:', event.resource.id);
          return new NextResponse('Invalid product', { status: 400 });
        }
        
        if (paymentAmount !== package_details.price) {
          console.error(`Payment amount mismatch: ${paymentAmount} vs ${package_details.price}`);
          return new NextResponse('Payment amount mismatch', { status: 400 });
        }
        
        // Get user from database
        const user = await prisma.user.findUnique({
          where: { email: event.resource.supplementary_data?.related_resources?.first?.item?.item_id }
        });
        
        if (!user) {
          console.error(`User not found: ${event.resource.supplementary_data?.related_resources?.first?.item?.item_id}`);
          return new NextResponse('User not found', { status: 404 });
        }

        // Update user credits in the database
        const updatedUser = await prisma.user.update({
          where: { email: event.resource.supplementary_data?.related_resources?.first?.item?.item_id },
          data: {
            credits: {
              increment: package_details.credits
            }
          }
        });

        // Invalidate cache for this user to ensure fresh data
        const userEmail = event.resource.supplementary_data?.related_resources?.first?.item?.item_id;
        if (userEmail) {
          db.invalidateCache(`user_${userEmail}`);
          db.invalidateCache(`session_${userEmail}`);
        }

        // Log the successful credit update
        console.log(`Added ${package_details.credits} credits to user ${event.resource.supplementary_data?.related_resources?.first?.item?.item_id}. New balance: ${updatedUser.credits}`);
        
        return new NextResponse(JSON.stringify({ 
          success: true,
          credits: updatedUser.credits
        }), { 
          status: 200,
          headers: {
            'Content-Type': 'application/json'
          }
        });
      }

      // Return 200 for unhandled webhook events
      return new NextResponse(JSON.stringify({ acknowledged: true }), { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Handle regular client-side request
    // Get the request body
    const body = await req.json();
    const { orderID, paypalProductId, userEmail } = body;
    
    if (!orderID || !userEmail) {
      console.error('Missing required information');
      return new NextResponse('Missing required information', { status: 400 });
    }

    // Find the credit package
    const package_details = CREDIT_PACKAGES.find(pkg => pkg.paypalProductId === paypalProductId);
    
    if (!package_details) {
      console.error('Invalid product ID:', paypalProductId);
      return new NextResponse('Invalid product', { status: 400 });
    }

    try {
      // Verify the order with PayPal
      const accessToken = await getPayPalAccessToken(
        PAYPAL_CLIENT_ID, 
        PAYPAL_CLIENT_SECRET,
        PAYPAL_API_URL
      );
      const orderData = await verifyPayPalOrder(orderID, accessToken, PAYPAL_API_URL);
      
      // Verify the payment amount matches the package price
      const paymentAmount = parseFloat(
        orderData.purchase_units?.[0]?.payments?.captures?.[0]?.amount?.value ||
        orderData.purchase_units?.[0]?.amount?.value
      );
      
      if (paymentAmount !== package_details.price) {
        console.error(`Payment amount mismatch: ${paymentAmount} vs ${package_details.price}`);
        return new NextResponse('Payment amount mismatch', { status: 400 });
      }
      
      // Get user from database
      const user = await prisma.user.findUnique({
        where: { email: userEmail }
      });
      
      if (!user) {
        console.error(`User not found: ${userEmail}`);
        return new NextResponse('User not found', { status: 404 });
      }

      // Update user credits in the database
      const updatedUser = await prisma.user.update({
        where: { email: userEmail },
        data: {
          credits: {
            increment: package_details.credits
          }
        }
      });

      // Invalidate cache for this user to ensure fresh data
      db.invalidateCache(`user_${userEmail}`);
      db.invalidateCache(`session_${userEmail}`);

      // Log the successful credit update
      console.log(`Added ${package_details.credits} credits to user ${userEmail}. New balance: ${updatedUser.credits}`);
      
      return new NextResponse(JSON.stringify({ 
        success: true,
        credits: updatedUser.credits
      }), { 
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    } catch (dbError) {
      console.error('Database or payment verification error:', dbError);
      return new NextResponse(dbError instanceof Error ? dbError.message : 'Database error', { status: 500 });
    }
  } catch (error) {
    console.error('Error processing payment:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 