import QuoteForm from '@/components/QuoteForm';
import H1Drop from '@/components/H1Drop';
import ParallaxCard from '@/components/ParallaxCard';

export const metadata = {
  title: 'Request a Free Estimate | P&S Contracting and Landscape',
  description: 'Get a free, no-obligation estimate for landscaping, hardscaping, and contracting services in Westmoreland County, PA. Fill out our form and we\'ll be in touch.',
  alternates: {
    canonical: 'https://ps15642.com/quote',
  },
  openGraph: {
    title: 'Free Estimate — Landscaping & Contracting | P&S Contracting and Landscape',
    description: 'Request your free estimate for landscaping, hardscaping, and contracting services in Westmoreland County, PA.',
    url: 'https://ps15642.com/quote',
    siteName: 'P&S Contracting and Landscape',
    images: [{ url: 'https://ps15642.com/hardscape.jpg', width: 1800, height: 800, alt: 'Request a free landscaping estimate — P&S Contracting and Landscape' }],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Estimate | P&S Contracting and Landscape',
    description: 'Request a free estimate for landscaping and contracting in Westmoreland County, PA.',
    images: ['https://ps15642.com/hardscape.jpg'],
  },
};

export default function QuotePage() {
  return (
    <div>
      <ParallaxCard imgUrl="/hardscape.jpg">
        <H1Drop color="text-white" size="text-4xl md:text-6xl">
          Free Estimate
        </H1Drop>
      </ParallaxCard>
      <div className="max-w-3xl mx-auto px-4 py-12">
        <p className="text-center text-gray-600 mb-8 text-lg">
          Tell us about your project and we'll get back to you with a free, no-obligation estimate. You can also reach us at{' '}
          <a href="tel:+17243828201" className="text-lime-700 font-medium hover:underline">(724) 382-8201</a>.
        </p>
        <QuoteForm />
      </div>
    </div>
  );
}
