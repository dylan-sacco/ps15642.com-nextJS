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

export default function TestimonialsSection({ testimonials }) {
  if (!testimonials || testimonials.length === 0) return null;

  return (
    <section className="bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-800 mb-2">
          What Our Customers Say
        </h2>
        <p className="text-center text-gray-500 text-sm mb-8">
          Proudly serving Westmoreland County, PA since 2007
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map(t => (
            <div key={t.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex flex-col gap-3">
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
          ))}
        </div>
      </div>
    </section>
  );
}
