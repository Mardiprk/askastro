import Link from 'next/link';
import { FC } from 'react';

interface BackButtonProps {
  href: string;
  label?: string;
}

const BackButton: FC<BackButtonProps> = ({ 
  href, 
  label = 'Back' 
}) => {
  return (
    <Link
      href={href}
      className="inline-flex items-center px-4 py-2 text-sm rounded-full bg-white shadow-sm border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors group max-w-fit"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-4 w-4 mr-2 transform group-hover:-translate-x-1 transition-transform text-[#A84A4A]"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
      </svg>
      {label}
    </Link>
  );
};

export default BackButton; 