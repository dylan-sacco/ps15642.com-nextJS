import ParallaxCard from "@/components/ParallaxCard";
import H1Drop from "@/components/H1Drop";
import TextSpan from "@/components/TextSpan";
import { FaCheck, FaHammer, FaCogs, FaShieldAlt } from "react-icons/fa";

export const metadata = {
  title: "Decks & Aluminum Railings | P&S Contracting and Landscape",
  description:
    "Custom outdoor deck construction and aluminum railing installation in North Huntingdon, PA. Built for safety, style, and durability.",
  openGraph: {
    title: "Decks & Aluminum Railings | P&S Contracting and Landscape",
    description:
      "Custom outdoor deck construction and aluminum railing installation in North Huntingdon, PA. Built for safety, style, and durability.",
    url: "https://ps15642.com/decks-railings",
    siteName: "P&S Contracting and Landscape",
    images: [
      {
        url: "https://ps15642.com/hs1.webp",
        width: 1800,
        height: 800,
        alt: "Deck and railing work by P&S Contracting",
      },
    ],
    locale: "en_US",
    type: "website",
  },
};

export default function DeckRailingPage() {
  return (
    <div>
      {/* Hero Section */}
      <div className="relative">
        <img
          src="/hs1.webp"
          alt="Decks and railings"
          className="w-full h-[60vh] object-cover"
        />
        <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-center px-6">
          <h1 className="text-white text-4xl md:text-6xl font-bold drop-shadow-lg">
            Outdoor Decks & Aluminum Railing Installation in North Huntingdon, PA
          </h1>
          <p className="text-white text-xl md:text-2xl mt-4">
            Professional Deck Building & Rail Systems | P&S Contracting and Landscape
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-20 space-y-20">
        {/* Intro */}
        <section className="text-center space-y-4 max-w-3xl mx-auto">
          <p className="text-lg md:text-xl">
            At P&S Contracting and Landscape, we don’t just build beautiful landscapes—we build the structures that make outdoor living functional, safe, and enjoyable. If you're looking to expand your living space, increase your home’s value, or simply enjoy more time outside, our custom deck construction and aluminum railing installation services are the perfect solution.
          </p>
          <p className="text-lg md:text-xl">
            Serving North Huntingdon, PA and surrounding areas, we provide high-quality outdoor contracting work built to last in Pennsylvania’s four-season climate.
          </p>
        </section>

        {/* Deck Construction */}
        <section className="grid md:grid-cols-2 gap-12 items-start">
          <div className="border-l-4 border-green-600 pl-6">
            <h2 className="text-2xl font-bold mb-4">Custom Deck Construction Built for Pennsylvania Weather</h2>
            <p>
              Your deck is an extension of your home—whether you’re grilling with friends, relaxing with family, or hosting outdoor events. We design and build decks that are:
            </p>
            <ul className="list-disc list-inside mt-4 space-y-1">
              <li>Durable & Weather-Resistant</li>
              <li>Code-Compliant & Professionally Installed</li>
              <li>Custom Sized & Shaped to Fit Your Yard</li>
              <li>Low-Maintenance Options Available</li>
            </ul>
            <p className="mt-4">
              We work with pressure-treated lumber, composite decking, and other high-quality materials that can stand up to Western Pennsylvania’s snow, rain, heat, and humidity.
            </p>
          </div>

          {/* Railing Installation */}
          <div className="border-l-4 border-green-600 pl-6">
            <h2 className="text-2xl font-bold mb-4">Sleek, Safe, and Stylish Aluminum Railings</h2>
            <p>
              Aluminum railings are a smart choice for homeowners looking for long-term safety, low maintenance, and a clean, modern look. We install railing systems for:
            </p>
            <ul className="list-disc list-inside mt-4 space-y-1">
              <li>Decks and Patios</li>
              <li>Stairs and Walkways</li>
              <li>Porches and Entryways</li>
            </ul>
            <p className="mt-4">
              Why aluminum? It doesn’t rot, rust, or require painting—and it offers both residential code compliance and elevated curb appeal.
            </p>
            <div className="mt-4 space-y-1">
              <p>✅ Rust-Free</p>
              <p>✅ Low Maintenance</p>
              <p>✅ Modern Styles & Colors</p>
              <p>✅ Great for Safety & Child-Friendly Environments</p>
            </div>
            <p className="mt-4">
              You’ll get all the safety without sacrificing the view.
            </p>
          </div>
        </section>

        <p className="text-center max-w-2x1 mx-auto space-y-4 text-lg md:text-xl">
            From the ground up, we make outdoor living easy, durable, and beautiful.
          </p>

        {/* Why Choose Us */}
        <section className="bg-gray-100 p-10 rounded-xl shadow text-center">
          <h3 className="text-2xl font-semibold mb-4">Why Choose P&S Contracting and Landscape?</h3>
          <ul className="grid md:grid-cols-2 gap-4 text-left max-w-3xl mx-auto">
            {[
              "✅ Experienced Local Deck Builders",
              "✅ Serving North Huntingdon, Irwin, and Surrounding Areas",
              "✅ Fully Licensed & Insured Contractor",
              "✅ One Trusted Company for Landscape, Hardscape, and Contracting Work",
              "✅ Clean Worksites & On-Time Project Completion",
            ].map((item, idx) => (
              <li key={idx} className="text-base">{item}</li>
            ))}
          </ul>
        </section>

        {/* Closing */}
        <section className="text-center space-y-4 max-w-2xl mx-auto">
          <h3 className="text-2xl md:text-3xl font-bold text-green-700 mt-6">
            Let’s Build Something Great Together
          </h3>
          <p className="text-lg">
            Looking for a reliable contractor in North Huntingdon, PA for your next deck project or aluminum railing install? Trust P&S Contracting and Landscape to bring your vision to life—with expert craftsmanship and attention to detail every step of the way.
          </p>
        </section>
      </div>
    </div>
  );
}
