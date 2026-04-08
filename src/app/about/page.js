import PageHeader from "@/components/PageHeader";
import MeetTheTeam from "@/components/MeetTheTeam";

export const dynamic = 'force-dynamic';

export const metadata = {
  title: "About Us | P&S Contracting and Landscape",
  description:
    "Learn about P&S Contracting and Landscape — a family-owned landscaping company proudly serving Westmoreland County, PA since 2007.",
  openGraph: {
    title: "About Us | P&S Contracting and Landscape",
    description:
      "Discover P&S Contracting and Landscape's values and services across Westmoreland County, PA.",
    url: "https://ps15642.com/about",
    siteName: "P&S Contracting and Landscape",
    images: [
      {
        url: "https://ps15642.com/hs1.webp",
        width: 1800,
        height: 800,
        alt: "P&S Contracting and Landscape",
      },
    ],
    locale: "en_US",
    type: "website",
  },
};

const stats = [
  { value: "18+",   label: "Years in Business"        },
  { value: "5.0",   label: "Stars on Angi"            },
  { value: "100%",  label: "Recommendation Rate"      },
  { value: "Free",  label: "Estimates & Consultations" },
];

const seasons = [
  {
    name: "Spring & Summer",
    accent: "bg-lime-600",
    items: [
      "Lawn maintenance & grass cutting",
      "Landscape design & installation",
      "Softscaping & plant bed creation",
      "Tree trimming & pruning",
      "Mulching & yard cleanup",
    ],
  },
  {
    name: "Fall",
    accent: "bg-amber-600",
    items: [
      "Hardscaping & concrete work",
      "Retaining walls & patios",
      "Drainage & French drains",
      "Major tree removal & stump grinding",
      "Decks, railings & contracting",
    ],
  },
  {
    name: "Winter",
    accent: "bg-sky-700",
    items: [
      "Select tree work & hazard removal",
      "Project planning & free estimates",
      "Consultation for spring installs",
    ],
  },
];

export default function AboutPage() {
  return (
    <div>
      {/* <PageHeader title="About P&S Contracting and Landscape" imgUrl="/hs1.webp" /> */}

      {/* ── Mission Statement ──────────────────────────────────────────────── */}
      <section className="bg-[#1a3022] text-white">
        <div className="max-w-4xl mx-auto px-6 py-16 text-center">
          <p className="text-xs font-semibold tracking-[0.3em] uppercase text-lime-400 mb-5">
            Our Mission
          </p>
          <blockquote className="text-2xl md:text-3xl font-semibold leading-snug">
            Every neighborhood that breaks ground loses trees, topsoil, and the
            natural landscape that made it home.{" "}
            <span className="text-lime-400">Our mission is to give it back</span>{" "}
            — one yard at a time.
          </blockquote>
          <p className="mt-6 text-white/65 text-base md:text-lg leading-relaxed max-w-2xl mx-auto">
            At P&amp;S Contracting and Landscape, we believe beautiful outdoor
            spaces don&apos;t just improve your property — they restore something
            essential to the communities we all share. Planned housing
            developments clear the land and move on. We come in and bring it
            back to life.
          </p>
        </div>
      </section>

      {/* ── Stats Row ─────────────────────────────────────────────────────── */}
      <section className="border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {stats.map(s => (
            <div key={s.label}>
              <p className="text-4xl font-bold text-lime-700">{s.value}</p>
              <p className="text-sm text-gray-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Our Story ─────────────────────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-6 py-14">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
          Our Roots
        </h2>
        <div className="space-y-5 text-gray-600 md:text-lg leading-relaxed">
          <p>
            P&amp;S Contracting and Landscape was founded in 2007 out of a
            simple belief: that the land around your home deserves as much care
            and thought as the home itself. What started as a small crew serving
            the Irwin area has grown into one of Westmoreland County&apos;s most
            trusted outdoor contractors — family-owned, deeply local, and built
            on a foundation of quality work and honest relationships.
          </p>
          <p>
            We are licensed, bonded, and insured, and we take on every project
            — residential or commercial — with the same level of dedication we
            would bring to our own properties. Over eighteen years, we&apos;ve
            earned a reputation for showing up on time, working clean, and
            delivering results that speak for themselves.
          </p>
          <p>
            Our customers consistently describe us as professional, detail-oriented,
            and genuinely invested in the outcome. We think that says it all. A
            perfect 5-star rating on Angi and a 100% recommendation rate on
            Facebook aren&apos;t goals we set — they&apos;re the natural result of
            doing the work right, every single time.
          </p>
        </div>
      </section>

      {/* ── Seasonal Services ─────────────────────────────────────────────── */}
      <section className="bg-gray-50 border-t border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 py-14">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            What We Do
          </h2>
          <p className="text-gray-500 mb-10 md:text-lg">
            We work year-round, letting each season guide where we focus our energy.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {seasons.map(season => (
              <div
                key={season.name}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm"
              >
                <div className={`${season.accent} px-5 py-3`}>
                  <h3 className="text-white font-semibold text-sm tracking-wide">
                    {season.name}
                  </h3>
                </div>
                <ul className="px-5 py-4 space-y-2">
                  {season.items.map(item => (
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
            ))}
          </div>
        </div>
      </section>

      {/* ── Passion & Values ──────────────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-6 py-14">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
          Why We Do It
        </h2>
        <div className="space-y-5 text-gray-600 md:text-lg leading-relaxed">
          <p>
            Landscaping isn&apos;t just maintenance — it&apos;s an act of care
            for the place you live. Every plant bed we install, every tree we
            shape, every patio we lay is a small but real contribution to making
            a neighborhood feel more like home. That&apos;s what drives us.
          </p>
          <p>
            We&apos;ve watched large-scale housing developments clear entire
            acres of mature trees and natural growth — and then hand buyers a
            bare lot and a handshake. Our passion is stepping into that space
            and rebuilding something living. Not just functional landscaping, but
            landscapes that grow, that change with the seasons, that outlast the
            people who planted them.
          </p>
          <p>
            We offer free estimates because we believe every homeowner deserves
            honest advice before they spend a dime. We offer a 10% senior
            discount because this community has given us eighteen years of
            trust, and that deserves to be returned. And we show up for
            emergency calls because your property&apos;s safety doesn&apos;t
            wait for a convenient time slot.
          </p>
        </div>

        {/* Goals block */}
        <div className="mt-10 grid sm:grid-cols-3 gap-4">
          {[
            {
              heading: "Restore",
              body: "Return natural beauty to properties cleared by development and years of neglect.",
            },
            {
              heading: "Sustain",
              body: "Design landscapes that thrive through every season with minimal environmental impact.",
            },
            {
              heading: "Serve",
              body: "Treat every client&apos;s property with the same pride and care we would our own.",
            },
          ].map(goal => (
            <div
              key={goal.heading}
              className="rounded-xl bg-lime-50 border border-lime-100 p-5"
            >
              <h3 className="font-bold text-lime-800 text-base mb-1">
                {goal.heading}
              </h3>
              <p
                className="text-sm text-gray-600 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: goal.body }}
              />
            </div>
          ))}
        </div>
      </section>

      {/* ── Accreditations strip ──────────────────────────────────────────── */}
      <section className="bg-gray-900 text-white">
        <div className=" mx-auto px-6 py-8 flex flex-wrap items-center justify-center gap-x-10 gap-y-3 text-sm text-gray-400 text-center">
          <span>Licensed &amp; Insured</span>
          <span className="hidden sm:inline text-gray-700">|</span>
          <span>BBB Accredited</span>
          <span className="hidden sm:inline text-gray-700">|</span>
          <span>Top 18% of PA Contractors &mdash; BuildZoom Score 97</span>
          <span className="hidden sm:inline text-gray-700">|</span>
          <span>10% Senior Discount</span>
          <span className="hidden sm:inline text-gray-700">|</span>
          <span>Emergency Services Available</span>
        </div>
      </section>

      {/* ── Meet the Team ─────────────────────────────────────────────────── */}
      <MeetTheTeam />
    </div>
  );
}
