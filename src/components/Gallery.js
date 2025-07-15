'use client';
import Image from 'next/image';
import { useState } from 'react';

export default function Gallery({ images }) {
  const [selectedImage, setSelectedImage] = useState(null);

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-w-6xl mx-auto p-4">
        {images.map((src, i) => (
          <div
            key={i}
            className="cursor-pointer overflow-hidden rounded-lg shadow-lg"
            onClick={() => setSelectedImage(src)}
          >
            <div className="aspect-square">
              <Image
                src={src}
                alt={`Gallery image ${i + 1}`}
                width={400}
                height={400}
                className="rounded-lg object-cover hover:scale-105 transition-transform duration-300"
                style={{ aspectRatio: '1 / 1' }}
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
          <img
            src={selectedImage}
            alt="Fullscreen view"
            className="max-w-full max-h-full object-contain"
          />
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-5 right-5 text-white text-3xl font-bold"
            aria-label="Close fullscreen image"
          >
            ×
          </button>
        </div>
      )}
    </>
  );
}
