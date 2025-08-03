import ParallaxCard from "@/components/ParallaxCard";
import H1Drop from "@/components/H1Drop";
import TextSpan from "@/components/TextSpan";
import { FaCheck } from "react-icons/fa";

export const metadata = {
  title: "Landscape Design & Removal | P&S Contracting and Landscape",
  description:
    "Custom landscaping, removal, seasonal planting, and lighting in North Huntingdon, PA. Designed for year-round beauty in Western Pennsylvania.",
  openGraph: {
    title: "Landscape Design & Removal | P&S Contracting and Landscape",
    description:
      "Custom landscaping, removal, seasonal planting, and lighting in North Huntingdon, PA. Designed for year-round beauty in Western Pennsylvania.",
    url: "https://ps15642.com/landscape",
    siteName: "P&S Contracting and Landscape",
    images: [
      {
        url: "https://ps15642.com/hs1.webp",
        width: 1800,
        height: 800,
        alt: "Landscaping and lighting work by P&S Contracting",
      },
    ],
    locale: "en_US",
    type: "website",
  },
};

export default function LandscapePage() {
  return (
    <div>
      {/* Hero */}
      <div className="relative">
        <img
          src="/hs1.webp"
          alt="Landscaping and lighting"
          className="w-full h-[60vh] object-cover"
        />
        <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-center px-6">
          <h1 className="text-white text-4xl md:text-6xl font-bold drop-shadow-lg">
            Landscape Design & Removal
          </h1>
          <p className="text-white text-xl md:text-3xl mt-4">
            North Huntingdon, PA
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-20 space-y-20">
        {/* Intro */}
        <section className="text-center space-y-4 max-w-3xl mx-auto">
          <p className="text-lg md:text-xl">
            Is your yard overgrown, outdated, or just lacking curb appeal? At P&S Contracting and Landscape, we offer expert landscape removal and redesign services to completely refresh your outdoor space. Whether you’re dealing with dying shrubs, poor drainage, or just a dull, lifeless lawn, we’ll create a custom landscape plan designed specifically for Western Pennsylvania’s seasons—with color and beauty all year long.
          </p>
        </section>

        {/* Removal */}
        <section className="border-l-4 border-green-600 pl-6">
          <h2 className="text-2xl font-bold mb-4">Landscape Removal</h2>
          <p>
            Before we can design something beautiful, we make sure to clear out what’s holding your yard back. Our team handles:
          </p>
          <ul className="list-disc list-inside mt-4 space-y-1">
            <li>Removal of overgrown shrubs and trees</li>
            <li>Old mulch beds, invasive roots, and debris</li>
            <li>Weed-infested or poorly planned garden areas</li>
            <li>Outdated hardscape and edging</li>
          </ul>
          <p className="mt-4">
            We do all removal cleanly and efficiently, preparing your space for a fresh start.
          </p>
        </section>

        {/* Seasonal Design */}
        <section className="border-l-4 border-green-600 pl-6">
          <h2 className="text-2xl font-bold mb-4">Seasonal Landscape Design</h2>
          <p>
            Western Pennsylvania has four full seasons—and your landscape should reflect that! We create designs that bloom and impress from spring through winter by using:
          </p>
          <div className="list-disc list-inside mt-4 space-y-1">
            <p>🌸 Spring Bloomers: Tulips, daffodils, azaleas</p>
            <p>🌼 Summer Color: Daylilies, coneflowers, hydrangeas</p>
            <p>🍂 Fall Interest: Ornamental grasses, burning bush, sedum</p>
            <p>🌲 Winter Structure: Evergreens, holly, red twig dogwood</p>
          </div>
          <p className="mt-4">
            Your yard won’t just look great one month a year—it’ll offer something unique in every season.
          </p>
        </section>

        {/* Lighting */}
        <section className="border-l-4 border-green-600 pl-6">
          <h2 className="text-2xl font-bold mb-4">Landscape Lighting</h2>
          <p>
            To truly complete the look and extend the enjoyment of your yard into the evening hours, we incorporate custom outdoor lighting, including:
          </p>
          <ul className="list-disc list-inside mt-4 space-y-1">
            <li>Pathway Lighting – for safety and elegance</li>
            <li>Accent Lighting – to highlight trees, walls, and water features</li>
            <li>Deck & Patio Lighting – ideal for entertaining and ambiance</li>
            <li>Energy-Efficient LED Options – long-lasting and low-maintenance</li>
          </ul>
          <p className="mt-4">
            Well-placed lighting not only enhances beauty but also adds safety and security to your home.
          </p>
        </section>

        {/* Why Choose Us */}
        <section className="bg-gray-50 p-10 rounded-xl text-center shadow">
          <h3 className="text-2xl font-semibold mb-4">Why Choose Us?</h3>
          <ul className="grid md:grid-cols-2 gap-4 text-left max-w-3xl mx-auto">
            {[
              "✅ Locally Owned in North Huntingdon, PA",
              "✅ Custom Designs Based on Your Property and Preferences",
              "✅ Knowledge of Native & Climate-Appropriate Plants",
              "✅ One Company for Design, Installation, and Lighting",
              "✅ Licensed, Insured & Trusted in Westmoreland County",
            ].map((text, index) => (
              <li key={index} className="text-base">{text}</li>
            ))}
          </ul>
        </section>

        {/* Final CTA */}
        <section className="text-center space-y-4 max-w-2xl mx-auto">
          <p className="text-lg md:text-xl">
            Whether you're starting from scratch or want to upgrade your current yard, P&S Contracting and Landscape is here to help with full-service removal, design, planting, and lighting.
          </p>
        </section>
      </div>
    </div>
  );
}
