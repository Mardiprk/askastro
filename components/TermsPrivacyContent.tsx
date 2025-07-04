import { FC } from 'react';

interface TermsPrivacyContentProps {
  isPrivacy?: boolean;
}

const TermsPrivacyContent: FC<TermsPrivacyContentProps> = ({ isPrivacy = false }) => {
  return (
    <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
      {/* Header with cosmic gradient */}
      <div className="relative py-10 px-8 bg-gradient-to-r from-[#A84A4A] to-[#c27575] text-white">
        <div className="absolute inset-0 opacity-20 mix-blend-overlay pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat',
            backgroundSize: '200px 200px'
          }}
        />
        <h1 className="font-eb-garamond text-3xl font-medium text-center relative z-10">
          {isPrivacy ? 'Privacy Policy' : 'Terms of Service'}
        </h1>
        <p className="text-white/80 text-center mt-2 text-sm relative z-10">
          Last updated: 21 March 2025
        </p>
      </div>

      {/* Content section */}
      <div className="p-8 bg-white">
        {isPrivacy ? (
          <div className="space-y-6">
            <section>
              <h2 className="text-xl font-medium text-gray-900 mb-3">Information We Collect</h2>
              <div className="space-y-4 text-gray-700 text-sm">
                <div className="flex items-start">
                  <div className="h-6 w-6 rounded-full bg-[#A84A4A]/10 flex items-center justify-center flex-shrink-0 mt-0.5 mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="#A84A4A" className="w-3.5 h-3.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  </div>
                  <p><span className="font-medium">Google Account Information:</span> When you sign in with Google, we collect your name, email address, and profile picture as provided by Google.</p>
                </div>
                <div className="flex items-start">
                  <div className="h-6 w-6 rounded-full bg-[#A84A4A]/10 flex items-center justify-center flex-shrink-0 mt-0.5 mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="#A84A4A" className="w-3.5 h-3.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  </div>
                  <p><span className="font-medium">Chat Messages:</span> We do not store messages you exchange with our AI astrologer. Conversations only exist during your active session and are not retained once you end your interaction.</p>
                </div>
                <div className="flex items-start">
                  <div className="h-6 w-6 rounded-full bg-[#A84A4A]/10 flex items-center justify-center flex-shrink-0 mt-0.5 mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="#A84A4A" className="w-3.5 h-3.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  </div>
                  <p><span className="font-medium">Usage Data:</span> We collect information about how you interact with our application, including session duration, features used, and preferences.</p>
                </div>
                <div className="flex items-start">
                  <div className="h-6 w-6 rounded-full bg-[#A84A4A]/10 flex items-center justify-center flex-shrink-0 mt-0.5 mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="#A84A4A" className="w-3.5 h-3.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  </div>
                  <p><span className="font-medium">Payment Information:</span> If you make purchases, we store transaction IDs and credit information (handled securely through our payment processor).</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-medium text-gray-900 mb-3">How We Use Your Information</h2>
              <p className="text-gray-700 text-sm mb-4">We use your information to provide and improve our services, including:</p>
              <ul className="space-y-2 text-gray-700 text-sm pl-6 list-disc">
                <li>Providing personalized astrological readings and insights</li>
                <li>Improving our AI systems and algorithm accuracy</li>
                <li>Communicating with you about your account and updates</li>
                <li>Processing transactions and managing credit balances</li>
                <li>Ensuring the security and functionality of our services</li>
              </ul>
            </section>

            <div className="border-t border-gray-200 my-6"></div>
            
          </div>
        ) : (
          <div className="space-y-6">
            <section>
              <h2 className="text-xl font-medium text-gray-900 mb-3">Credit System</h2>
              <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                <div className="flex items-start mb-4">
                  <div className="h-8 w-8 rounded-full bg-[#A84A4A] flex items-center justify-center flex-shrink-0 mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="white" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-md font-medium text-gray-900 mb-1">Message Credit Deduction</h3>
                    <p className="text-gray-700 text-sm">Each message you send to our AI astrologer deducts <span className="font-medium text-[#A84A4A]">5 credits</span> from your account balance.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="h-8 w-8 rounded-full bg-[#A84A4A] flex items-center justify-center flex-shrink-0 mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="white" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-md font-medium text-gray-900 mb-1">No Refund Policy</h3>
                    <p className="text-gray-700 text-sm">All purchases are final. We do not offer refunds for credits once they have been purchased or for credits that have been used.</p>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-medium text-gray-900 mb-3">User Conduct</h2>
              <p className="text-gray-700 text-sm mb-4">When using our service, you agree not to:</p>
              <ul className="space-y-2 text-gray-700 text-sm pl-6 list-disc">
                <li>Use the service for any illegal purposes</li>
                <li>Attempt to manipulate or abuse the credit system</li>
                <li>Share or distribute content generated by our AI without attribution</li>
                <li>Use automated systems to interact with our platform</li>
                <li>Harass, threaten, or violate the rights of others</li>
              </ul>
            </section>

            <div className="border-t border-gray-200 my-6"></div>

            <section>
              <h2 className="text-xl font-medium text-gray-900 mb-3">Disclaimers</h2>
              <div className="p-4 border-l-4 border-yellow-400 bg-yellow-50 text-sm text-gray-700 rounded-r-lg">
                <p className="font-medium text-yellow-800 mb-1">Astrological Advice Disclaimer</p>
                <p>The astrological readings and advice provided through our service are for entertainment purposes only. Decisions regarding health, finance, relationships, or other important matters should not be made solely based on our astrological insights.</p>
              </div>
            </section>
          </div>
        )}
      </div>

      {/* Footer with attribution */}
      <div className="bg-gray-50 py-4 px-8 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <p className="text-xs text-gray-500">© {new Date().getFullYear()} AskAstro. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default TermsPrivacyContent; 