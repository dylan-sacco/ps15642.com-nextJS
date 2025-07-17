'use client';
import { X } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

export default function Gallery({ images }) {
  const [selectedImage, setSelectedImage] = useState(null);

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-6xl mx-auto p-4">
        {images.map((src, i) => (
          <div
            key={i}
            className="cursor-pointer overflow-hidden rounded-lg shadow-lg"
            onClick={() => setSelectedImage(src)}
          >
            <div className="aspect-square relative">
              <Image
                src={src}
                alt={`Gallery image ${i + 1}`}
                fill
                className="rounded-lg object-cover hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                priority={i < 3} // preload top 3 images for LCP
              />
            </div>
          </div>
        ))}
      </div>

      {/* Fullscreen Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative w-full h-full max-w-screen-lg max-h-screen">
            <Image
              src={selectedImage}
              alt="Fullscreen view"
              fill
              className="object-contain"
              sizes="100vw"
              priority
            />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-5 right-5 text-white text-3xl font-bold outline outline-gray-300 rounded bg-[#0005] p-1"
              aria-label="Close fullscreen image"
            >
              <X/>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
