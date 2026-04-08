export default function GreenCard({ children }) {
  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital@0;1&display=swap');`}</style>
      <div
        className="relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #091810 0%, #0d2218 45%, #112a1b 100%)' }}
      >
        {/* Animated glow layer */}
        <div className="absolute inset-0 section-glow pointer-events-none" aria-hidden="true" />

        {/* Corner radial accents */}
        <div
          className="absolute top-0 left-0 w-72 h-72 opacity-10 pointer-events-none"
          style={{ background: 'radial-gradient(circle at top left, #84cc16, transparent 65%)' }}
          aria-hidden="true"
        />
        <div
          className="absolute bottom-0 right-0 w-72 h-72 opacity-10 pointer-events-none"
          style={{ background: 'radial-gradient(circle at bottom right, #84cc16, transparent 65%)' }}
          aria-hidden="true"
        />

        <section className="relative z-10 max-w-3xl mx-auto px-8 py-16 text-center">
          {/* Decorative opening quote */}
          <div
            className="text-lime-400 select-none pointer-events-none"
            style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '5rem', lineHeight: 1, opacity: 0.22, marginBottom: '-0.75rem' }}
            aria-hidden="true"
          >&ldquo;</div>

          <p
            className="text-white text-xl md:text-3xl leading-relaxed"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            {children}
          </p>

          {/* Decorative rule */}
          <div className="mt-8 flex items-center justify-center gap-4">
            <div className="h-px w-20 bg-gradient-to-r from-transparent to-lime-600/50" />
            <div className="flex gap-1.5 items-center">
              <div className="w-1.5 h-1.5 rounded-full bg-lime-600/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-lime-400" />
              <div className="w-1.5 h-1.5 rounded-full bg-lime-600/60" />
            </div>
            <div className="h-px w-20 bg-gradient-to-l from-transparent to-lime-600/50" />
          </div>
        </section>
      </div>
    </>
  );
}
