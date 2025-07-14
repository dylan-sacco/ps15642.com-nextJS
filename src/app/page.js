import ParallaxCard from "@/components/ParallaxCard";
import ZoomContainerBS from "@/components/ZoomContainerBS";
import Image from "next/image";

export default function Home() {
  return (
    <>
      {/* Paralax effect */}
      <ParallaxCard imgUrl={"/hs1.jpg"}>
        <h1 className="text-white text-4xl font-bold">P & S</h1>
        <p className="text-white text-2xl">Contracting and Landscape</p>
      </ParallaxCard>
      {/* About Section */}
      <div className="max-w-6xl mx-auto p-6">
        <p className="text-[20px]">For 15 years, P&S Contracting and Landscape has been the premier landscaping company throughout all of Westmoreland County, Pennsylvania. By providing stellar landscaping services in all facets: design, maintenance, soft-scaping and installation for all of our commercial and residential clients, we are now largely regarded as the absolute best landscaping company in the business!</p>
      </div>

      {/* hoverZoom section */}
      <div className="max-w-6xl grid grid-cols-1 lg:grid-cols-3 gap-4 p-6 mx-auto">

        <ZoomContainerBS
          title={"Contracting"}
          description={"Whether you need a railing built for your deck or shelves for your garage, we can help you."}
          buttonText={"Learn More"}
          buttonURL={"/contracting"}
          imageURL={"/home-image-1.jpg"}
        />
        <ZoomContainerBS
          imageURL={"/home-image-2.jpg"} />
        <ZoomContainerBS
          imageURL={"/home-image-3.jpg"} />

      </div>

      {/* Contact Section */}
      <div className="bg-green-600">
        <section className="max-w-6xl mx-auto p-6">
          <p className="text-white text-[30px] font-bold text-center">
            In need of a complete overhaul of your current landscaping layout; or maybe just a few additions for that added elegance, such as a mini grove of trees or a tasteful flower bed? Feel free to give us a call for your cost-free consultation!
          </p>
        </section>
      </div>

      <div className="max-w-6xl mx-auto p-6 text-center">
        <h1>proudly serving the following areas</h1>
        <div className="grid grid-cols-3 gap-4 max-w-4xl mx-auto p-6">
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
    </>
  );
}
