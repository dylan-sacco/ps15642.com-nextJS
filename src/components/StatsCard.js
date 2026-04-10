import ScrollReveal from "./ScrollReveal";

export default function StatsCard({stats}) {
  return (
    <section className=" bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
        {stats.map((s, i) => {
          const inner = (
            <>
              <p className="text-4xl font-bold text-lime-700">{s.value}</p>
              <p className="text-sm text-gray-500 mt-1">{s.label}</p>
            </>
          );
          return (
            <ScrollReveal key={s.label} delay={i * 80} from="scale">
              <StatsCardElement
                label={s.label}
                value={s.value}
                href={s.href}
              />
            </ScrollReveal>
          );
        })}
      </div>
    </section>
  )
}

export function StatsCardElement({ value, label, href, linkText = "verified ↗" }) {
  const inner = (
    <>
      <p className="text-4xl font-bold text-lime-700">{value}</p>
      <p className="text-sm text-gray-500 mt-1">{label}</p>
    </>
  )
  return (
    href ? (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="group hover:opacity-80 transition-opacity block"
        title={`View source for ${label}`}
      >
        {inner}
        <span className="text-[10px] text-gray-400 group-hover:text-lime-600 transition-colors">
          {linkText}
        </span>
      </a>
    ) : (
      <div>{inner}</div>
    )
  )
}