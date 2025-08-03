import ParallaxCard from "@/components/ParallaxCard";
import H1Drop from "@/components/H1Drop";
import TextSpan from "@/components/TextSpan";
import { FaCheck, FaTree, FaLeaf, FaTools } from "react-icons/fa";

export const metadata = {
  title: "Tree Service & Stump Grinding | P&S Contracting and Landscape",
  description:
    "Professional tree removal, trimming, and stump grinding in North Huntingdon, PA. Serving homes and businesses across Westmoreland County.",
  openGraph: {
    title: "Tree Service & Stump Grinding | P&S Contracting and Landscape",
    description:
      "Professional tree removal, trimming, and stump grinding in North Huntingdon, PA. Serving homes and businesses across Westmoreland County.",
    url: "https://ps15642.com/tree-work",
    siteName: "P&S Contracting and Landscape",
    images: [
      {
        url: "https://ps15642.com/hs1.webp",
        width: 1800,
        height: 800,
        alt: "Tree services and stump removal by P&S Contracting",
      },
    ],
    locale: "en_US",
    type: "website",
  },
};

export default function TreeWorkPage() {
  return (
    <div>
      {/* Hero Section */}
      <div className="relative">
        <img
          src="/hs1.webp"
          alt="Tree service background"
          className="w-full h-[60vh] object-cover"
        />
        <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-center px-6">
          <h1 className="text-white text-4xl md:text-6xl font-bold drop-shadow-lg">
            Tree Service & Stump Grinding
          </h1>
          <p className="text-white text-xl md:text-2xl mt-4">
            North Huntingdon, PA
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-20 space-y-20">
        {/* Intro Section */}
        <section className="text-center space-y-4 max-w-3xl mx-auto">
          <p className="text-lg md:text-xl">
            If you're searching for professional tree services in North Huntingdon, PA, you've come to the right place. At P&S Contracting and Landscape, we offer expert tree removal, tree trimming, and stump grinding services that protect your property, enhance your landscape, and keep your yard looking its best.
          </p>
        </section>

        {/* Services Section */}
        <section className="grid md:grid-cols-2 gap-12 items-start">
          {/* Tree Services */}
          <div className="border-l-4 border-green-600 pl-6">
            <h2 className="text-2xl font-bold mb-4">Tree Services</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>
                <strong>Tree Trimming & Pruning</strong> – Improve tree health, remove dead limbs, and prevent storm damage.
              </li>
              <li>
                <strong>Tree Removal</strong> – Safely eliminate hazardous, dying, or unwanted trees from your property.
              </li>
              <li>
                <strong>Storm Damage & Emergency Response</strong> – Quick cleanup for downed trees and debris.
              </li>
              <li>
                <strong>Tree Health Inspections</strong> – Spot disease or structural issues early.
              </li>
            </ul>
            <p className="mt-4">
              Our team uses the latest equipment and techniques to ensure safe and efficient results—every time.
            </p>
          </div>

          {/* Stump Grinding */}
          <div className="border-l-4 border-green-600 pl-6">
            <h2 className="text-2xl font-bold mb-4">Stump Grinding</h2>
            <p>
              Don’t let old stumps become a problem. Our stump grinding services help homeowners and businesses eliminate:
            </p>
            <ul className="list-disc list-inside mt-4 space-y-2">
              <li>Trip hazards in high-traffic areas</li>
              <li>Pest infestations from decaying wood</li>
              <li>Unwanted regrowth from leftover root systems</li>
              <li>Eyesores that ruin curb appeal</li>
            </ul>
            <p className="mt-4">
              With fast, affordable grinding, we’ll leave your yard clean and ready for new landscaping, grass, or outdoor projects.
            </p>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="bg-gray-100 p-10 rounded-xl text-center shadow">
          <h3 className="text-2xl font-semibold mb-4">Why Choose Us?</h3>
          <div className="grid md:grid-cols-2 gap-4 text-left max-w-3xl mx-auto">
            <p>✅ Locally Owned & Operated</p>
            <p>✅ Fully Licensed & Insured</p>
            <p>✅ Free Estimates</p>
            <p>✅ Dependable Service in North Huntingdon, Irwin, and Surrounding Areas</p>
        </div>
        </section>

        {/* Final CTA */}
        <section className="text-center space-y-4 max-w-2xl mx-auto">
          <p className="text-lg md:text-xl">
            Whether you're dealing with a dangerous tree, need regular trimming, or want to finally remove that ugly stump, contact the pros at P&S Contracting and Landscape today.
          </p>
        </section>
      </div>
    </div>
  );
}
