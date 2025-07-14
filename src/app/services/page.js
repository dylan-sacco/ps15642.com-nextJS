import ParallaxCard from "@/components/ParallaxCard";

export default function servicePage() {
  return (
    <div>
      <ParallaxCard imgUrl="/hs1.jpg">
              <div className="relative">
                {/* Shadow Text Behind */}
                <h1 className="text-3xl md:text-[60px] font-bold absolute text-black translate-x-[2px] translate-y-[2px]">
                  Our Services
                </h1>
                {/* Foreground Text */}
                <h1 className="text-3xl md:text-[60px] font-bold text-white relative">
                  Our Services
                </h1>
              </div>
            </ParallaxCard>
      <p>Welcome to our website! We are dedicated to providing the best service possible.</p>
      <p>Our team is passionate about what we do and we strive to exceed your expectations.</p>
    </div>
  );
}