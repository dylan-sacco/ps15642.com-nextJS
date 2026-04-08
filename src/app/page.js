import GreenCard from "@/components/GreenCard";
import H1Drop from "@/components/H1Drop";
import HeroEarthwork from "@/components/HeroEarthwork";
import ParallaxCard from "@/components/ParallaxCard";
import TextSpan from "@/components/TextSpan";
import ZoomContainerBS from "@/components/ZoomContainerBS";
// import TestimonialsSection from "@/components/TestimonialsSection";
// import { getFeaturedTestimonials } from "@/lib/testimonials";
import Image from "next/image";
import Link from "next/link";
import Script from "next/script";

export const metadata = {
  title: "P&S Contracting and Landscape | Westmoreland County, PA",
  description:
    "Professional landscaping, hardscaping, and property maintenance services in Westmoreland County, PA. Contact P&S Contracting and Landscape today.",
  openGraph: {
    title: "P&S Contracting and Landscape | Westmoreland County, PA",
    description:
      "Transform your property with expert landscaping from P&S Contracting and Landscape.",
    url: "https://ps15642.com/",
    siteName: "P&S Contracting and Landscape",
    images: [
      {
        url: "https://ps15642.com/hs1.webp",
        width: 1800,
        height: 800,
        alt: "Home page preview - P&S Contracting",
      },
    ],
    locale: "en_US",
    type: "website",
  },
};

const zoomContainerList = [
  {
    title: "Contracting",
    description:
      "Whether you need a railing built for your deck or shelves for your garage, we can help you.",
    buttonText: "Learn More",
    buttonURL: "/contracting",
    imageURL: "/home-image-1.jpg",
  },
  {
    title: "Tree Service &\nStump Grinding",
    description: "Expert tree care with a focus on safety and precision — even for the toughest jobs.",
    buttonURL: "/treeandstump",
    imageURL: "/dave-in-tree.jpg",
  },

  {
    title: "Hardscape",
    description:
      "When it comes to durable concrete patios and walkways we create a perfect balance of structure and nature to transform your outdoor space.",
    buttonURL: "/hardscape",
    imageURL: "/hardscape.jpg",
  },
  {
    title: "Landscape",
    description:
      "We can design a landscape with lush plant beds that bloom different times of the year to help keep your landscape alive throughout the year.",
    buttonURL: "landscape",
    imageURL: "/landscape.jpg",
  },
];



export default async function Home() {
  const foundingYear = 2007;
  const yearsInBusiness = new Date().getFullYear() - foundingYear;
  // const testimonials = getFeaturedTestimonials();

  return (
    <div>
      <HeroEarthwork/>

      {/* Paralax effect */}
      {/* <ParallaxCard imgUrl={"/hs1.webp"} >
        <H1Drop color="text-white">
          <h1 className=" text-4xl md:text-6xl font-bold font-serif">P & S</h1>
          <p className=" text-2xl md:text-4xl font-serif">Contracting and Landscape</p>
        </H1Drop>
      </ParallaxCard> */}

      {/* About Section */}
      <TextSpan>
        For {yearsInBusiness} years, P&S Contracting and Landscape has been the premier landscaping company throughout all of Westmoreland County, Pennsylvania. By providing stellar landscaping services in all facets: design, maintenance, soft/hard-scaping and installation for all of our commercial and residential clients, we are now largely regarded as the absolute best landscaping company in the business!
      </TextSpan>

      {/* hoverZoom section */}
      <div className="max-w-6xl grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 p-4 sm:p-6 mx-auto">
        {zoomContainerList.map((item, index) => (
          <ZoomContainerBS
            key={index}
            title={item.title}
            description={item.description}
            buttonText={item.buttonText}
            buttonURL={item.buttonURL}
            imageURL={item.imageURL}
          />
        ))}
      </div>

      {/* <TestimonialsSection testimonials={testimonials} /> */}

      { 
        process.env.FEATURABLE && 
        <>
          <div id={process.env.FEATURABLE} data-featurable-async ></div>
          <Script
            src="https://featurable.com/assets/bundle.js"
            strategy="afterInteractive"
          />
        </>
      }

      {/* Contact Section */}
      <GreenCard>
        In need of a complete overhaul of your current landscaping layout; or maybe just a few additions for that added elegance, such as a mini grove of trees or a tasteful flower bed? Feel free to give us a call for your cost-free consultation!
      </GreenCard>

      <div className="max-w-6xl mx-auto p-6 text-center">
        <H1Drop>
          <Link href="/locations" className="hover:text-lime-700 transition-colors">
            proudly serving the following areas
          </Link>
        </H1Drop>

        {/* Featured location pages */}
        <div className="grid sm:grid-cols-3 gap-4 max-w-4xl mx-auto py-6">
          {[
            { name: 'Irwin, PA', href: '/locations/irwin' },
            { name: 'Greensburg, PA', href: '/locations/greensburg' },
            { name: 'North Huntingdon, PA', href: '/locations/north-huntingdon' },
          ].map(loc => (
            <Link
              key={loc.href}
              href={loc.href}
              className="block rounded-xl border border-lime-200 bg-lime-50 px-4 py-5 font-semibold text-lime-800 hover:bg-lime-600 hover:text-white hover:border-lime-600 transition-colors shadow-sm"
            >
              {loc.name}
            </Link>
          ))}
        </div>

        {/* Full service area list */}
        <div className="grid md:grid-cols-3 gap-4 max-w-4xl mx-auto pb-6 text-sm text-gray-600">
          <div>North Irwin, PA</div>
          <div>Larimer, PA</div>
          <div>Manor, PA</div>
          <div>Wendel, PA</div>
          <div>Yohoghany, PA</div>
          <div>Latrobe, PA</div>
          <div>Pleasant Unity, PA</div>
          <div>Weltytown, PA</div>
          <div>McChesneytown-Loyalhanna, PA</div>
          <div>Youngstown, PA</div>
          <div>Lawson Heights, PA</div>
          <div>Whitney, PA</div>
          <div>McChesneytown, PA</div>
          <div>Hostetter, PA</div>
          <div>Trafford, PA</div>
          <div>Level Green, PA</div>
          <div>White Oak, PA</div>
          <div>Harrison City, PA</div>
          <div>Herminie, PA</div>
          <div>Ardara, PA</div>
          <div>Rillton, PA</div>
          {/* <div>Darragh, PA</div> */}
        </div>
      </div>
    </div>
  );
}
