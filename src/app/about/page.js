import ParallaxCard from "@/components/ParallaxCard";

export default function AboutPage() {
  return (
    <div>
      <ParallaxCard imgUrl="/hs1.jpg">
        <div className="relative">
          {/* Shadow Text Behind */}
          <h1 className="text-3xl font-bold absolute text-black translate-x-[2px] translate-y-[2px]">
            About P&S Contracting and Landscape
          </h1>
          {/* Foreground Text */}
          <h1 className="text-3xl font-bold text-white relative">
            About P&S Contracting and Landscape
          </h1>
        </div>
      </ParallaxCard>
    </div>
  );
}
