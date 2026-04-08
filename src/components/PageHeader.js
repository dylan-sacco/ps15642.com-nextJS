/**
 * PageHeader — compact interior-page header.
 * Replaces ParallaxCard on About, Services, Blog listing, and CMS-driven pages.
 * If imgUrl is supplied, it renders as the background with a dark overlay.
 * Without imgUrl, falls back to a solid dark-green panel.
 */
export default function PageHeader({ title, subtitle, imgUrl }) {
  return (
    <div
      className="relative w-full overflow-hidden flex items-center justify-center"
      style={{ height: "clamp(160px, 26vh, 240px)" }}
      role="banner"
    >
      {/* Background — image or solid colour */}
      <div
        className="absolute inset-0 bg-[#1a3022]"
        style={
          imgUrl
            ? {
                backgroundImage: `url(${imgUrl})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }
            : undefined
        }
        aria-hidden="true"
      />

      {/* Darkening overlay — only needed when an image is present */}
      {imgUrl && (
        <div className="absolute inset-0 bg-black/62" aria-hidden="true" />
      )}

      {/* Bottom lime accent bar */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[3px]"
        style={{
          background:
            "linear-gradient(90deg, #84cc16 0%, #4ade80 60%, transparent 100%)",
        }}
        aria-hidden="true"
      />

      {/* Text */}
      <div className="relative z-10 text-center px-6 max-w-3xl">
        <h1 className="text-2xl md:text-[2.25rem] font-bold text-white tracking-tight leading-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-[11px] md:text-xs text-white/50 mt-2 tracking-[0.2em] uppercase">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}
