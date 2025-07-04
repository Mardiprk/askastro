import TermsPrivacyContent from '@/components/TermsPrivacyContent';
import BackButton from '@/components/ui/BackButton';

export const metadata = {
  title: 'Terms of Service | AskAstro',
  description: 'Terms of Service for AskAstro, your personal AI astrologer',
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto mb-6">
        <BackButton href="/" label="Back to Home" />
      </div>
      <TermsPrivacyContent isPrivacy={false} />
    </main>
  );
} 