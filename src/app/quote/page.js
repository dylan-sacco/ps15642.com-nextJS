import QuoteForm from '@/components/QuoteForm';
import H1Drop from '@/components/H1Drop';
import ParallaxCard from '@/components/ParallaxCard';

export const metadata = {
  title: 'Request a Free Estimate | P&S Contracting and Landscape',
  description: 'Get a free, no-obligation estimate from P&S Contracting and Landscape. Fill out our quote request form and we\'ll be in touch.',
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
