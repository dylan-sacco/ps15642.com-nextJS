"use client";
import {
  ParallaxBanner,
  ParallaxBannerLayer,
  ParallaxProvider,
} from "react-scroll-parallax";
import { useEffect, useState } from "react";
import Image from "next/image";

export default function ParallaxCard({ imgUrl = '/hs1.webp', children }) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // ✅ Preload image always
  const preloadImage = (
    <Image
      src={imgUrl}
      alt="Preload Background"
      width={1920}
      height={1080}
      priority
      style={{ display: "none" }}
    />
  );

  if (isMobile) {
    return (
      <>
        {preloadImage}
        <div
          className="w-full flex items-center justify-center text-white text-center bg-cover bg-center overflow-hidden"
          style={{
            backgroundImage: `url(${imgUrl})`,
            aspectRatio: "1 / 1",
            maxHeight: 400,
            backgroundColor: "#000",
          }}
        >
          <div className="bg-black/50 w-full h-full flex flex-col items-center justify-center p-4">
            {children}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {preloadImage}
      <ParallaxProvider>
        <ParallaxBanner style={{ aspectRatio: "2 / 1", maxHeight: 400 }}>
          <ParallaxBannerLayer image={imgUrl} speed={-20} />
          <ParallaxBannerLayer className="h-full w-full bg-opacity-40 flex flex-col items-center justify-center drop-shadow-lg bg-[#0005] text-white text-center font-serif">
            {children}
          </ParallaxBannerLayer>
        </ParallaxBanner>
      </ParallaxProvider>
    </>
  );
}
