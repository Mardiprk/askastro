'use client';

import { useRef, useEffect } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';

interface ReCaptchaProps {
  onVerify: (token: string | null) => void;
}

const ReCaptchaComponent = ({ onVerify }: ReCaptchaProps) => {
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  useEffect(() => {
    // Reset ReCAPTCHA on component mount
    if (recaptchaRef.current) {
      recaptchaRef.current.reset();
    }
  }, []);

  const handleVerify = (token: string | null) => {
    onVerify(token);
  };

  return (
    <div className="flex justify-center my-4">
      <ReCAPTCHA
        ref={recaptchaRef}
        sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}
        onChange={handleVerify}
      />
    </div>
  );
};

export default ReCaptchaComponent; 