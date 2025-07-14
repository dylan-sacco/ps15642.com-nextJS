"use client";
import { Parallax, ParallaxBanner, ParallaxBannerLayer, ParallaxProvider, useParallax } from "react-scroll-parallax";

export default function ParallaxCard({ imgUrl, children }) {
  return (
    <ParallaxProvider>
      <ParallaxBanner style={{ aspectRatio: '3 / 1', maxHeight:400 }}>
        <ParallaxBannerLayer image={imgUrl} speed={-20} />
        <ParallaxBannerLayer className="h-full w-full  bg-opacity-40 flex flex-col items-center justify-center drop-shadow-lg bg-[#0005] text-white text-center">
          {children}
        </ParallaxBannerLayer>
      </ParallaxBanner>
    </ParallaxProvider>
  );
}
