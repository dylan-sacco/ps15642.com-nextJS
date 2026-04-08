export const metadata = {
  title: "Services | P&S Contracting and Landscape",
  description:
    "Explore our landscaping, hardscaping, drainage, and maintenance services tailored for homes and businesses in Westmoreland County, PA.",
  openGraph: {
    title: "Services | P&S Contracting and Landscape",
    description:
      "Professional landscaping, hardscaping, and maintenance services by P&S Contracting and Landscape.",
    url: "https://ps15642.com/services",
    siteName: "P&S Contracting and Landscape",
    images: [
      {
        url: "https://ps15642.com/hs1.webp",
        width: 1800,
        height: 800,
        alt: "Our Services - P&S Contracting and Landscape",
      },
    ],
    locale: "en_US",
    type: "website",
  },
};

const services = [
  {
    slug: "landscape",
    label: "Landscape",
    heading: "Landscape Design & Installation",
    summary:
      "Custom design, planting, and seasonal color for homes and businesses. We work with what the property needs — not a template.",
    items: [
      "Shrubs, ornamental trees & perennial beds",
      "Softscaping & plant bed creation",
      "Seasonal color planting",
      "Removal, cleanup & mulching",
      "Outdoor landscape lighting",
    ],
    accent: "bg-lime-600",
  },
  {
    slug: "treeandstump",
    label: "Tree Service",
    heading: "Tree Service & Stump Grinding",
    summary:
      "Safe removal, trimming, and stump grinding across Westmoreland County. Cleanup is always part of the job.",
    items: [
      "Tree removal (including near structures)",
      "Trimming, pruning & crown work",
      "Stump grinding below grade",
      "Storm cleanup & hazard removal",
      "Dead or leaning tree assessment",
    ],
    accent: "bg-emerald-700",
  },
  {
    slug: "hardscape",
    label: "Hardscape",
    heading: "Hardscape & Concrete Work",
    summary:
      "Patios, sidewalks, retaining walls, and more. Durable concrete work built for Western PA winters.",
    items: [
      "Poured concrete patios (broom or stamped)",
      "Sidewalks, walkways & steps",
      "Retaining walls & drainage",
      "Fire pit surrounds & masonry",
      "Repair & section replacement",
    ],
    accent: "bg-stone-600",
  },
  {
    slug: "contracting",
    label: "Contracting",
    heading: "Decks & Aluminum Railings",
    summary:
      "Pressure-treated, composite, or cedar decks built to code — plus aluminum railing installs on new and existing structures.",
    items: [
      "Custom deck design & construction",
      "Pressure-treated, composite & cedar",
      "Aluminum railing installation",
      "Stairs, benches & built-in features",
      "Railing replacement on existing decks",
    ],
    accent: "bg-amber-700",
  },
];

const highlights = [
  { value: "Free", label: "Estimates on every job" },
  { value: "10%", label: "Senior discount" },
  { value: "Licensed", label: "Bonded & insured" },
  { value: "18+", label: "Years serving Westmoreland County" },
];

export default function ServicesPage() {
  return (
    <div>
      {/* ── Intro ─────────────────────────────────────────────────────────── */}
      <section className="bg-[#1a3022] text-white">
        <div className="max-w-4xl mx-auto px-6 py-16 text-center">
          <p className="text-xs font-semibold tracking-[0.3em] uppercase text-lime-400 mb-5">
            What We Offer
          </p>
          <h1 className="text-3xl md:text-4xl font-bold leading-snug mb-6">
            Full-service outdoor work —{" "}
            <span className="text-lime-400">one crew, every season.</span>
          </h1>
          <p className="text-white/65 text-base md:text-lg leading-relaxed max-w-2xl mx-auto">
            From spring planting to fall hardscape installs to winter tree work,
            we handle the full range of what your property needs. Every job comes
            with a free estimate and the same crew that&apos;s been doing this across
            Westmoreland County for over eighteen years.
          </p>
        </div>
      </section>

      {/* ── Quick Highlights ──────────────────────────────────────────────── */}
      <section className="border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {highlights.map(h => (
            <div key={h.label}>
              <p className="text-4xl font-bold text-lime-700">{h.value}</p>
              <p className="text-sm text-gray-500 mt-1">{h.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Service Cards ─────────────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-6 py-14">
        <div className="grid md:grid-cols-2 gap-6">
          {services.map(svc => (
            <div
              key={svc.slug}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm flex flex-col"
            >
              <div className={`${svc.accent} px-5 py-3`}>
                <h2 className="text-white font-semibold text-sm tracking-wide">
                  {svc.label}
                </h2>
              </div>
              <div className="px-5 pt-4 pb-2 flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {svc.heading}
                </h3>
                <p className="text-sm text-gray-500 mb-4 leading-relaxed">
                  {svc.summary}
                </p>
                <ul className="space-y-2">
                  {svc.items.map(item => (
                    <li
                      key={item}
                      className="text-sm text-gray-600 flex items-start gap-2"
                    >
                      <span className="text-lime-500 mt-0.5 flex-shrink-0">&#10003;</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="px-5 py-4">
                <a
                  href={`/${svc.slug}`}
                  className="inline-block text-sm font-semibold text-lime-700 hover:text-lime-900 transition-colors"
                >
                  Learn more &rarr;
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────────── */}
      <section className="bg-gray-50 border-t border-gray-100">
        <div className="max-w-4xl mx-auto px-6 py-14 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            Not sure where to start?
          </h2>
          <p className="text-gray-500 md:text-lg mb-8 max-w-xl mx-auto">
            Every estimate is free. We&apos;ll come out, look at the property, and
            give you honest advice before any money changes hands.
          </p>
          <a
            href="/contact"
            className="inline-block bg-lime-700 hover:bg-lime-800 text-white font-semibold px-8 py-3 rounded-lg transition-colors"
          >
            Get a Free Estimate
          </a>
        </div>
      </section>
    </div>
  );
}
