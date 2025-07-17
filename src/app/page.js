import GreenCard from "@/components/GreenCard";
import H1Drop from "@/components/H1Drop";
import ParallaxCard from "@/components/ParallaxCard";
import TextSpan from "@/components/TextSpan";
import ZoomContainerBS from "@/components/ZoomContainerBS";
import Image from "next/image";

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
        url: "https://ps15642.com/hs1.jpg",
        width: 1800,
        height: 800,
        alt: "Home page preview - P&S Contracting",
      },
    ],
    locale: "en_US",
    type: "website",
  },
};


export default function Home() {
  return (
    <div>
      {/* Paralax effect */}
      <ParallaxCard imgUrl={"/hs1.jpg"} >
      <H1Drop color="text-white">
        <h1 className=" text-4xl md:text-6xl font-bold font-serif">P & S</h1>
        <p className=" text-2xl md:text-4xl font-serif">Contracting and Landscape</p>
      </H1Drop>
        
      </ParallaxCard>
      
      {/* About Section */}
      <TextSpan>
        For 15 years, P&S Contracting and Landscape has been the premier landscaping company throughout all of Westmoreland County, Pennsylvania. By providing stellar landscaping services in all facets: design, maintenance, soft-scaping and installation for all of our commercial and residential clients, we are now largely regarded as the absolute best landscaping company in the business!
      </TextSpan>

      {/* hoverZoom section */}
      <div className="max-w-6xl grid grid-cols-1 lg:grid-cols-3 gap-4 p-6 mx-auto">

        <ZoomContainerBS
          title={"Contracting"}
          description={"Whether you need a railing built for your deck or shelves foWhether you need a railing built for your deck or shelves for your garage, we can help you.  "}
          buttonText={"Learn More"}
          buttonURL={"/"}
          imageURL={"/home-image-1.jpg"}
        />
        <ZoomContainerBS
          title="Tree Service"
          description="Expert tree care with a focus on safety and precision — even for the toughest jobs."
          imageURL={"/home-image-2.jpg"} />
        <ZoomContainerBS
          title="Hard And Soft Scape"
          description="Whether it's durable stone patios and walkways or lush plant beds, we create a perfect balance of structure and nature to transform your outdoor space."
          imageURL={"/home-image-3.jpg"} />

      </div>
      

      {/* Contact Section */}
      <GreenCard>
        In need of a complete overhaul of your current landscaping layout; or maybe just a few additions for that added elegance, such as a mini grove of trees or a tasteful flower bed? Feel free to give us a call for your cost-free consultation!
      </GreenCard>

      <div className=" max-w-6xl mx-auto p-6 text-center">
          <H1Drop>
            proudly serving the following areas
          </H1Drop>
        <div className="grid md:grid-cols-3 gap-4 max-w-4xl mx-auto p-6">
          <div>North Huntingdon, PA</div>
          <div>North Irwin, PA</div>
          <div>Larimer, PA</div>
          <div>Irwin, PA</div>
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
          <div>Darragh, PA</div>
        </div>
      </div>
    </div>
  );
}
