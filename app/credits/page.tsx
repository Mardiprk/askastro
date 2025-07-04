"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { CREDIT_PACKAGES } from "@/app/lib/constants";
import Link from 'next/link';
import { PayPalScriptProvider, PayPalButtons, usePayPalScriptReducer } from "@paypal/react-paypal-js";

const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || '';

// PayPal wrapper component to handle loading state
function PayPalButtonWrapper({ 
  createOrder, 
  onApprove, 
  onError, 
  onCancel, 
  isDisabled,
  setReady 
}: { 
  createOrder: any; 
  onApprove: any; 
  onError: (err: any) => void; 
  onCancel: () => void; 
  isDisabled: boolean;
  setReady: (ready: boolean) => void;
}) {
  const [{ isPending }] = usePayPalScriptReducer();
  
  useEffect(() => {
    setReady(!isPending);
  }, [isPending, setReady]);
  
  return (
    <>
      {isPending ? (
        <div className="flex justify-center items-center py-4 text-sm text-gray-500">
          <svg className="animate-spin mr-2 h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Loading payment options...</span>
        </div>
      ) : (
        <PayPalButtons
          style={{ layout: "vertical", shape: "rect" }}
          createOrder={createOrder}
          onApprove={onApprove}
          onError={onError}
          onCancel={onCancel}
          disabled={isDisabled}
        />
      )}
    </>
  );
}

interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  price: number;
  paypalProductId: string;
}

export default function CreditsPage() {
  const { status, data: session } = useSession();
  const router = useRouter();
  const [selectedPackage, setSelectedPackage] = useState(CREDIT_PACKAGES[1].id);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paypalReady, setPaypalReady] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [userCredits, setUserCredits] = useState<number | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
    }
  }, [status, router]);

  // Reset error message when package selection changes
  useEffect(() => {
    setError(null);
  }, [selectedPackage]);

  const selectedPackageDetails = CREDIT_PACKAGES.find(pkg => pkg.id === selectedPackage);

  const handleApprove = async (data: any, actions: any) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Capture the funds from the transaction
      const details = await actions.order.capture();
      console.log('PayPal payment captured:', details);
      
      // Verify the payment with our server
      const response = await fetch('/api/paypal-webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderID: data.orderID,
          paypalProductId: selectedPackageDetails?.paypalProductId,
          userEmail: session?.user?.email
        }),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to verify payment with server');
      }

      // Show success message with updated credits
      if (result.credits) {
        setUserCredits(result.credits);
        setSuccessMessage(`Payment successful! ${selectedPackageDetails?.credits} credits have been added to your account. Your new balance is ${result.credits} credits.`);
      } else {
        setSuccessMessage(`Payment successful! ${selectedPackageDetails?.credits} credits have been added to your account.`);
      }
      
      // Redirect to success page after 3 seconds
      setTimeout(() => {
        router.push('/credits/success');
      }, 3000);
      
    } catch (error) {
      console.error('Error processing payment:', error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred processing your payment');
    } finally {
      setIsLoading(false);
    }
  };

  const createOrder = (data: any, actions: any) => {
    if (!selectedPackageDetails) {
      setError('No package selected');
      return Promise.reject(new Error('No package selected'));
    }

    return actions.order.create({
      purchase_units: [
        {
          description: `${selectedPackageDetails.name} - ${selectedPackageDetails.credits} credits`,
          amount: {
            currency_code: "USD",
            value: selectedPackageDetails.price.toString()
          },
          custom_id: selectedPackageDetails.paypalProductId,
          payee: {
            email_address: "mk1659770@gmail.com"
          }
        }
      ],
      application_context: {
        shipping_preference: 'NO_SHIPPING'
      }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-0 right-0 bg-black/80 text-white p-2 text-xs z-50 rounded-tl-md">
          <div>ENV: {process.env.NODE_ENV}</div>
          <div>PayPal ID: {PAYPAL_CLIENT_ID ? `${PAYPAL_CLIENT_ID.substring(0, 6)}...` : 'Not set'}</div>
        </div>
      )}
      
      <PayPalScriptProvider options={{ 
        clientId: PAYPAL_CLIENT_ID,
        currency: "USD",
        intent: "capture",
        components: "buttons"
      }}>
        <div className="max-w-4xl mx-auto px-4 py-10">
          {/* Back button */}
          <Link
            href="/chat"
            className="inline-flex items-center px-4 py-2 text-sm rounded-full bg-white shadow-sm border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors group mb-10"
          >
            <svg
              className="h-4 w-4 mr-2 transform group-hover:-translate-x-1 transition-transform text-[#A84A4A]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Chat
          </Link>
          
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-eb-garamond font-medium text-[#18181B] mb-3">Get More Credits</h1>
          </div>

          {/* Main content */}
          <div className="flex flex-col md:flex-row gap-8">
            {/* Package selection */}
            <div className="w-full md:w-1/2">
              <div className="space-y-4">
                {CREDIT_PACKAGES.map((pkg: CreditPackage) => (
                  <div
                    key={pkg.id}
                    className={`border rounded-xl p-4 cursor-pointer transition-all ${
                      selectedPackage === pkg.id
                        ? 'border-[#A84A4A] bg-gradient-to-r from-[#f8f9ff] to-[#eef0ff] shadow-md'
                        : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                    } ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}
                    onClick={() => !isLoading && setSelectedPackage(pkg.id)}
                  >
                    <div className="flex items-center">
                      {/* Radio button */}
                      <div className="mr-4 flex-shrink-0">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          selectedPackage === pkg.id ? 'border-[#A84A4A]' : 'border-gray-300'
                        }`}>
                          {selectedPackage === pkg.id && (
                            <div className="w-3 h-3 rounded-full bg-[#A84A4A]"></div>
                          )}
                        </div>
                      </div>
                      
                      {/* Package details */}
                      <div className="flex-grow">
                        <div className="flex justify-between items-center mb-2">
                          <h3 className="text-lg font-medium text-[#18181B]">{pkg.name}</h3>
                          <div className="text-2xl font-bold text-[#A84A4A]">${pkg.price}</div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <svg className="w-4 h-4 text-yellow-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            <span className="text-sm text-gray-700">{pkg.credits} credits</span>
                          </div>
                        </div>
                        
                        {pkg.id === 'premium' && (
                          <div className="mt-2">
                            <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                              Best Value
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Order summary and payment */}
            <div className="w-full md:w-1/2">
              <div className="bg-white rounded-xl overflow-hidden shadow-md border border-gray-100">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
                  <h2 className="text-xl font-medium text-[#18181B]">Order Summary</h2>
                </div>

                <div className="p-6">
                  {selectedPackageDetails && (
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-[#A84A4A]/10 flex items-center justify-center mr-3">
                          <svg className="w-5 h-5 text-[#A84A4A]" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        </div>
                        <div>
                          <div className="text-base font-medium text-[#18181B]">
                            {selectedPackageDetails.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {selectedPackageDetails.credits} credits
                          </div>
                        </div>
                      </div>
                      <span className="text-xl font-bold text-[#A84A4A]">
                        ${selectedPackageDetails.price}
                      </span>
                    </div>
                  )}

                  <div className="border-t border-gray-100 pt-4 mb-6">
                    <div className="flex justify-between items-center">
                      <span className="text-base font-bold text-[#18181B]">Total</span>
                      <span className="text-xl font-bold text-[#A84A4A]">
                        ${selectedPackageDetails?.price}
                      </span>
                    </div>
                  </div>

                  {/* Status messages */}
                  {successMessage && (
                    <div className="bg-green-50 border border-green-100 text-green-700 px-4 py-3 rounded-lg mb-6 text-sm flex items-start">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 flex-shrink-0 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>{successMessage}</span>
                    </div>
                  )}

                  {error && (
                    <div className="bg-red-50 border border-red-100 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm flex items-start">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 flex-shrink-0 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      <span>{error}</span>
                    </div>
                  )}

                  {/* Payment section */}
                  {isLoading ? (
                    <div className="w-full mb-3 bg-gray-50 rounded-lg p-6 flex justify-center items-center">
                      <svg className="animate-spin mr-3 h-5 w-5 text-[#A84A4A]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span className="text-base font-medium text-gray-700">Processing payment...</span>
                    </div>
                  ) : (
                    <div className="w-full">
                      <div className="mb-4 text-sm text-gray-600 text-center">
                        Secure payment via PayPal
                      </div>
                      <PayPalButtonWrapper
                        createOrder={createOrder}
                        onApprove={handleApprove}
                        onError={(err) => {
                          console.error("PayPal Error:", err);
                          setError("Payment failed. Please try again later.");
                        }}
                        onCancel={() => {
                          console.log("Payment cancelled by user");
                          setError("Payment was cancelled. You can try again when you're ready.");
                        }}
                        isDisabled={isLoading || !selectedPackageDetails || !!successMessage}
                        setReady={setPaypalReady}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </PayPalScriptProvider>
    </div>
  );
}