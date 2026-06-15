'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

function StarRating({ rating }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(n => (
        <svg key={n} className={`w-4 h-4 ${n <= rating ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

function TestimonialCard({ testimonial: t, className = '' }) {
  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex flex-col gap-3 min-w-40  ${className}`}>
      <StarRating rating={t.rating} />
      <p className="text-gray-700 text-sm leading-relaxed flex-1">"{t.text}"</p>
      <div className="flex items-center justify-between mt-2">
        <div>
          <p className="text-sm font-semibold text-gray-800">{t.name}</p>
          {t.location && <p className="text-xs text-gray-400">{t.location}</p>}
        </div>
        {t.source === 'google' && (
          <span className="text-xs text-blue-500 font-medium bg-blue-50 px-2 py-0.5 rounded">Google</span>
        )}
      </div>
    </div>
  );
}

export default function TestimonialsSection({ testimonials }) {
  const [current, setCurrent] = useState(0);

  if (!testimonials || testimonials.length === 0) return null;

  const prev = () => setCurrent(i => (i === 0 ? testimonials.length - 1 : i - 1));
  const next = () => setCurrent(i => (i === testimonials.length - 1 ? 0 : i + 1));

  const looped = [...testimonials, ...testimonials];

  return (
    <section className="bg-gray-50 py-12 px-4">
      <style>{`
        @keyframes testimonial-scroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .testimonial-track {
          animation: testimonial-scroll ${Math.max(20, testimonials.length * 6)}s linear infinite;
        }
        .testimonial-track:hover {
          animation-play-state: paused;
        }
      `}</style>

      <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-800 mb-2">
        What Our Customers Say
      </h2>
      <p className="text-center text-gray-500 text-sm mb-8">
        Proudly serving Westmoreland County, PA since 2007
      </p>

      {/* Desktop: auto-scrolling ticker */}
      <div className="hidden md:block overflow-hidden">
        <div className="testimonial-track flex gap-6 w-max">
          {looped.map((t, i) => (
            <TestimonialCard key={`${t.id}-${i}`} testimonial={t} className="w-80 flex-shrink-0" />
          ))}
        </div>
      </div>

      {/* Mobile: single card with arrows */}
      <div className="md:hidden">
        <div className="flex items-center gap-2 px-2">
          <button
            onClick={prev}
            className="flex-shrink-0 p-1.5 rounded-full bg-white shadow border border-gray-200 text-gray-600 hover:text-green-600 transition-colors"
            aria-label="Previous review"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex-1 min-w-0">
            <TestimonialCard testimonial={testimonials[current]} className="w-full" />
          </div>

          <button
            onClick={next}
            className="flex-shrink-0 p-1.5 rounded-full bg-white shadow border border-gray-200 text-gray-600 hover:text-green-600 transition-colors"
            aria-label="Next review"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-2 mt-4">
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`w-2 h-2 rounded-full transition-colors ${i === current ? 'bg-green-600' : 'bg-gray-300'}`}
              aria-label={`Go to review ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
