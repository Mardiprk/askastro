'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from './button';
import { Input } from './input';
import { Label } from './label';

interface DOBInputProps {
  email: string;
  onComplete: () => void;
  initialDob?: string | null;
}

export function DOBInput({ email, onComplete, initialDob = null }: DOBInputProps) {
  const [dob, setDob] = useState(initialDob || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [isUpdating, setIsUpdating] = useState(!!initialDob);
  const router = useRouter();

  // When initialDob changes, update the state
  useEffect(() => {
    if (initialDob) {
      setDob(initialDob);
      setIsUpdating(true);
    }
  }, [initialDob]);

  const validateDate = (dateString: string) => {
    // Check if the date is in the correct format (YYYY-MM-DD)
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateString)) return false;
    
    // Check if the date is valid
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return false;
    
    // Check if the date is not in the future
    const today = new Date();
    if (date > today) return false;

    // Calculate age and check if it's reasonable (13-100 years)
    const age = Math.floor((today.getTime() - date.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
    if (age < 13 || age > 100) {
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!dob) {
      setError('Please enter your date of birth');
      return;
    }

    if (!validateDate(dob)) {
      setError('Please enter a valid date. You must be at least 13 years old.');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/user/update-dob', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, dob }),
      });

      if (!response.ok) {
        throw new Error('Failed to update DOB');
      }

      // Update the session storage with the new DOB data to prevent unnecessary API calls
      try {
        const cachedData = sessionStorage.getItem(`user_dob_${email}`);
        if (cachedData) {
          const data = JSON.parse(cachedData);
          data.dob = dob;
          data.dob_collected = true;
          sessionStorage.setItem(`user_dob_${email}`, JSON.stringify(data));
        } else {
          // Create new cache entry if none exists
          sessionStorage.setItem(`user_dob_${email}`, JSON.stringify({
            dob,
            dob_collected: true
          }));
        }
      } catch (error) {
        console.error('Error updating cached DOB data:', error);
        // Continue even if caching fails
      }

      onComplete();
    } catch (error) {
      console.error('Error updating DOB:', error);
      setError('Failed to update your date of birth. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md dark:bg-gray-800">
        <h2 className="text-xl font-bold mb-4 text-center">
          {isUpdating ? 'Update Your Birth Date' : 'Welcome to AskAstro!'}
        </h2>
        <p className="mb-6 text-center">
          {isUpdating 
            ? 'You can change your date of birth to receive more accurate astrological insights.' 
            : 'Please enter your date of birth so we can personalize your astrological readings.'}
        </p>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <Label htmlFor="dob">Date of Birth</Label>
            <Input
              id="dob"
              type="date"
              value={dob}
              onChange={(e) => {
                setDob(e.target.value);
                setError(''); // Clear error when user changes the input
              }}
              className="w-full"
              placeholder="YYYY-MM-DD"
            />
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
          </div>
          
          <div className="flex justify-between">
            <Button 
              type="button" 
              variant="outline"
              onClick={onComplete}
              className="px-4"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="px-8 bg-[#A84A4A] hover:bg-[#953a3a]">
              {isSubmitting ? 'Saving...' : (isUpdating ? 'Update' : 'Continue')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
} 