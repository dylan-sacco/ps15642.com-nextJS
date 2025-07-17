'use client';
import { useState } from 'react';
import Image from 'next/image';

export default function ZoomContainerBS({
  title = "Default Text",
  description = "Default Text",
  buttonText = "Learn More",
  buttonURL = "/",
  imageURL = "/home-image-1.jpg", // ensure this is a public path or imported static image
}) {
  const [isActive, setIsActive] = useState(false);

  const toggleActive = () => setIsActive(!isActive);
  const deactivate = () => setIsActive(false);

  return (
    <div
      className="relative group overflow-hidden rounded-lg shadow-md text-white text-center h-[300px] w-full"
      tabIndex={0}
      onClick={toggleActive}
      onBlur={deactivate}
    >
      {/* Background wrapper for transform */}
      <div
        className={`absolute inset-0 z-0 transition-transform duration-500 ease-in-out ${
          isActive ? 'scale-110' : 'scale-100'
        } group-hover:scale-110`}
      >
        <Image
          src={imageURL}
          alt={title}
          fill
          priority
          className="object-cover"
        />
      </div>

      {/* Overlay */}
      <div className="relative z-10 h-full bg-black/50 flex items-center justify-center p-4">
        <div
          className={`text-white text-center transition-all duration-500 ease-out transform ${
            isActive ? 'translate-y-0 opacity-100' : 'translate-y-[40%] opacity-100'
          } group-hover:translate-y-0`}
        >
          <p className="text-2xl font-semibold mb-2">{title}</p>

          {!isActive && (
            <p className="text-sm text-lime-200 italic transition-opacity duration-500 block md:hidden">
              {buttonText}
            </p>
          )}

          <div
            className={`transition-opacity duration-500 ${
              isActive ? 'opacity-100' : 'opacity-0'
            } group-hover:opacity-100`}
          >
            <hr className="w-full border-white/50 mb-4 border-dashed border-[2px]" />
            <p className="mb-4">{description}</p>
            <hr className="w-full border-white/50 mb-4 border-dashed border-[2px]" />
            <a href={buttonURL}>
              <button className="btn bg-lime-500 hover:bg-lime-600 text-white px-4 py-2 rounded">
                {buttonText}
              </button>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
