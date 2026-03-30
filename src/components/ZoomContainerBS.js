'use client';
import { useState } from 'react';
import Image from 'next/image';

export default function ZoomContainerBS({
  title = "Default Text",
  description = "Default Text",
  buttonText = "Learn More",
  buttonURL = "/",
  imageURL = "/home-image-1.jpg",
}) {
  const [isActive, setIsActive] = useState(false);

  return (
    <div
      className="relative group overflow-hidden rounded-lg shadow-md h-[160px] sm:h-[220px] lg:h-[300px] w-full"
      tabIndex={0}
      onClick={() => setIsActive(a => !a)}
      onBlur={() => setIsActive(false)}
    >
      {/* Background image zooms on hover */}
      <div className="absolute inset-0 z-0 transition-transform duration-500 ease-in-out scale-100 group-hover:scale-110">
        <Image src={imageURL} alt={title} fill priority className="object-cover" />
      </div>

      {/* Overlay — always flex-centered so the block sits in the middle */}
      <div className="relative z-10 h-full bg-black/50 flex items-center justify-center p-3 sm:p-5">
        <div className="text-white text-center w-full">

          {/* Title — always visible */}
          <p className="text-sm sm:text-xl lg:text-2xl font-semibold whitespace-pre-line leading-tight">
            {title}
          </p>

          {/* Body — collapses to nothing when hidden, expands on hover/tap */}
          <div className={`overflow-hidden transition-all duration-500 ease-in-out ${
            isActive ? 'max-h-64 opacity-100 mt-2 sm:mt-3' : 'max-h-0 opacity-0 mt-0'
          } group-hover:max-h-64 group-hover:opacity-100 group-hover:mt-2 sm:group-hover:mt-3`}>
            <hr className="w-full border-white/50 mb-2 sm:mb-3 border-dashed border-[2px]" />
            <p className="mb-2 sm:mb-3 text-xs sm:text-sm lg:text-base">{description}</p>
            <hr className="w-full border-white/50 mb-2 sm:mb-3 border-dashed border-[2px]" />
            <a href={buttonURL}>
              <button className="bg-lime-500 hover:bg-lime-600 text-white px-3 py-1 sm:px-4 sm:py-2 rounded text-xs sm:text-sm transition-colors">
                {buttonText}
              </button>
            </a>
          </div>

          {/* Desktop hint — hidden on mobile, disappears on hover or active */}
          <p className={`hidden md:block text-xs text-lime-200 italic mt-1 transition-opacity duration-300 group-hover:opacity-0 ${
            isActive ? 'opacity-0' : 'opacity-100'
          }`}>
            Hover to learn more
          </p>

          {/* Mobile hint — hidden on desktop, disappears when active */}
          <p className={`md:hidden text-xs text-lime-200 italic mt-1 transition-opacity duration-300 ${
            isActive ? 'opacity-0' : 'opacity-100'
          }`}>
            Tap to learn more
          </p>

        </div>
      </div>
    </div>
  );
}
