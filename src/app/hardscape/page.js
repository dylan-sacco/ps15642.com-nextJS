import ParallaxCard from "@/components/ParallaxCard";
import H1Drop from "@/components/H1Drop";
import TextSpan from "@/components/TextSpan";
import { FaCheck } from "react-icons/fa";

export const metadata = {
  title: "Hardscape Services | P&S Contracting and Landscape",
  description:
    "Concrete patios, sidewalks, and outdoor living features in North Huntingdon, PA. Durable, stylish, and professionally installed.",
  openGraph: {
    title: "Hardscape Services | P&S Contracting and Landscape",
    description:
      "Concrete patios, sidewalks, and outdoor living features in North Huntingdon, PA. Durable, stylish, and professionally installed.",
    url: "https://ps15642.com/hardscape",
    siteName: "P&S Contracting and Landscape",
    images: [
      {
        url: "https://ps15642.com/hs1.webp",
        width: 1800,
        height: 800,
        alt: "Hardscape work by P&S Contracting",
      },
    ],
    locale: "en_US",
    type: "website",
  },
};

export default function HardscapePage() {
  return (
    <div>
      {/* Hero Section */}
      <div className="relative">
        <img
          src="/hs1.webp"
          alt="Hardscaping"
          className="w-full h-[60vh] object-cover"
        />
        <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-center px-6">
          <h1 className="text-white text-4xl md:text-6xl font-bold drop-shadow-lg">
            Hardscape Services
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
            Looking to upgrade your outdoor space with lasting beauty and function? At P&S Contracting and Landscape, we specialize in high-quality hardscape design and installation throughout North Huntingdon, PA and surrounding areas. Whether you're dreaming of a custom concrete patio, a safe and stylish sidewalk, or a full outdoor living area, our expert team brings your vision to life—on time and on budget.
          </p>
        </section>

        {/* Patio and Sidewalk */}
        <section className="grid md:grid-cols-2 gap-12 items-start">
          <div className="border-l-4 border-green-600 pl-6">
            <h2 className="text-2xl font-bold mb-4">Concrete Patios</h2>
            <p>
              A professionally installed concrete patio is more than just a place to put your grill—it’s the foundation of your outdoor lifestyle. We create durable, low-maintenance patios that complement your landscape and enhance your home's value.
            </p>
            <ul className="list-disc list-inside mt-4 space-y-1">
              <li>Stamped & Decorative Concrete Options</li>
              <li>Custom Shapes & Layouts</li>
              <li>Slip-Resistant Finishes</li>
              <li>Built to Last Through PA Weather</li>
            </ul>
          </div>

          <div className="border-l-4 border-green-600 pl-6">
            <h2 className="text-2xl font-bold mb-4">Concrete Sidewalks</h2>
            <p>
              Cracked or uneven walkways aren’t just an eyesore—they’re a liability. Our concrete sidewalk installations offer:
            </p>
            <ul className="list-disc list-inside mt-4 space-y-1">
              <li>Safe, level walking surfaces</li>
              <li>Curb appeal that boosts property value</li>
              <li>Durability to withstand years of foot traffic and freeze-thaw cycles</li>
            </ul>
            <p className="mt-4">
              We handle everything from new installations to replacements and repairs for homes and businesses.
            </p>
          </div>
        </section>

        {/* Outdoor Living */}
        <section className="border-l-4 border-green-600 pl-6">
          <h2 className="text-2xl font-bold mb-4">Outdoor Living Features</h2>
          <p>
            Want to take your backyard to the next level? Our custom outdoor living solutions transform basic yards into functional, enjoyable spaces:
          </p>
          <ul className="list-disc list-inside mt-4 space-y-1">
            <li>Outdoor Kitchens & Grilling Areas</li>
            <li>Fire Pits & Seating Walls</li>
            <li>Retaining Walls & Built-In Planters</li>
            <li>Walkways, Steps & Decorative Borders</li>
          </ul>
          <p className="mt-4">
            We combine craftsmanship, quality materials, and smart design to create hardscapes that invite relaxation and entertaining for years to come.
          </p>
        </section>

        {/* Why Choose Us */}
        <section className="bg-gray-100 p-10 rounded-xl text-center shadow">
          <h3 className="text-2xl font-semibold mb-4">Why Choose Us?</h3>
          <ul className="grid md:grid-cols-2 gap-4 text-left max-w-3xl mx-auto">
            {[
              "✅ Experienced Local Hardscaping Team",
              "✅ Concrete Experts Serving Westmoreland County",
              "✅ Free On-Site Consultations & Estimates",
              "✅ Fully Licensed and Insured",
              "✅ Clean, Professional Job Sites from Start to Finish",
            ].map((text, index) => (
              <li key={index} className="text-base">{text}</li>
            ))}
          </ul>
        </section>

        {/* Final CTA */}
        <section className="text-center space-y-4 max-w-2xl mx-auto">
          <p className="text-lg md:text-xl">
            Let’s talk about your next concrete patio, sidewalk, or outdoor living project. At P&S Contracting and Landscape, we deliver dependable, high-quality hardscape services you can trust.
          </p>
        </section>
      </div>
    </div>
  );
}
