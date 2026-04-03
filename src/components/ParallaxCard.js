"use client";
import {
  ParallaxBanner,
  ParallaxBannerLayer,
  ParallaxProvider,
} from "react-scroll-parallax";
import { useEffect, useState } from "react";
import Image from "next/image";

export default function ParallaxCard({ imgUrl = '/hs1.webp', speed: speedProp, children }) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

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

  const speed = speedProp ?? (isMobile ? -5 : -8);
  const aspect = isMobile ? "1 / 1" : "2 / 1";
  const maxHeight = isMobile ? 320 : 400;

  return (
    <>
      {preloadImage}
      <ParallaxProvider>
        <ParallaxBanner style={{ aspectRatio: aspect, maxHeight }}>
          <ParallaxBannerLayer image={imgUrl} speed={speed} />
          <ParallaxBannerLayer className="h-full w-full flex flex-col items-center justify-center drop-shadow-lg bg-[#0005] text-white text-center font-serif">
            {children}
          </ParallaxBannerLayer>
        </ParallaxBanner>
      </ParallaxProvider>
    </>
  );
}
