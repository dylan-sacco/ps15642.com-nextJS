
export default function GreenCard({ children }) {
  return (
    <>
      <div
        className="relative overflow-hidden"
        style={{ background: 'var(--gradient-dark-panel)' }}
      >

        <section className="relative z-10 max-w-3xl mx-auto px-8 py-16 text-center">
          {/* Decorative opening quote */}
          <div
            className="text-brand-accent select-none pointer-events-none"
            style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '5rem', lineHeight: 1, opacity: 0.22, marginBottom: '-0.75rem' }}
            aria-hidden="true"
          >&ldquo;</div>

          <p
            className="text-white! text-xl md:text-3xl leading-relaxed"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            {children}
          </p>

          {/* Decorative rule */}
          <div className="mt-8 flex items-center justify-center gap-4">
            <div className="h-px w-20 bg-gradient-to-r from-transparent to-brand/50" />
            <div className="flex gap-1.5 items-center">
              <div className="w-1.5 h-1.5 rounded-full bg-brand/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-brand-accent" />
              <div className="w-1.5 h-1.5 rounded-full bg-brand/60" />
            </div>
            <div className="h-px w-20 bg-gradient-to-l from-transparent to-brand/50" />
          </div>
        </section>
      </div>
    </>
  );
}
