import { useState } from 'react';

export const useRecaptcha = () => {
  const [isVerified, setIsVerified] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const verifyToken = async (token: string | null) => {
    if (!token) {
      setError('Please complete the reCAPTCHA verification');
      setIsVerified(false);
      return false;
    }

    setIsVerifying(true);
    setError(null);

    try {
      const response = await fetch('/api/verify-recaptcha', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      if (data.success) {
        setIsVerified(true);
        return true;
      } else {
        setError(data.message || 'reCAPTCHA verification failed');
        setIsVerified(false);
        return false;
      }
    } catch (error) {
      setError('Failed to verify reCAPTCHA');
      setIsVerified(false);
      return false;
    } finally {
      setIsVerifying(false);
    }
  };

  return {
    isVerified,
    isVerifying,
    error,
    verifyToken,
  };
}; 