'use client';
import { X, Play } from 'lucide-react';
import { useState } from 'react';

export default function Gallery({ images }) {
  const [selected, setSelected] = useState(null);

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-6xl mx-auto p-4">
        {images.map((item, i) => (
          <div
            key={i}
            className="cursor-pointer overflow-hidden rounded-lg shadow-lg"
            onClick={() => setSelected(item)}
          >
            <div className="aspect-square relative">
              {item.isVideo ? (
                <>
                  {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
                  <video
                    src={item.src}
                    muted
                    preload="metadata"
                    className="absolute inset-0 w-full h-full object-cover rounded-lg hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="bg-black/50 rounded-full p-3">
                      <Play className="w-8 h-8 text-white fill-white" />
                    </div>
                  </div>
                </>
              ) : (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={item.src}
                  alt={`Gallery image ${i + 1}`}
                  className="absolute inset-0 w-full h-full object-cover rounded-lg hover:scale-105 transition-transform duration-300"
                  loading={i < 3 ? 'eager' : 'lazy'}
                />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Fullscreen Modal */}
      {selected && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center"
          onClick={() => setSelected(null)}
        >
          <div className="relative w-full h-full max-w-screen-lg max-h-screen flex items-center justify-center">
            {selected.isVideo ? (
              /* eslint-disable-next-line jsx-a11y/media-has-caption */
              <video
                src={selected.src}
                controls
                autoPlay
                className="w-full h-full object-contain"
                onClick={e => e.stopPropagation()}
              />
            ) : (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={selected.src}
                alt="Fullscreen view"
                className="w-full h-full object-contain"
              />
            )}
            <button
              onClick={() => setSelected(null)}
              className="absolute top-5 right-5 text-white text-3xl font-bold outline outline-gray-300 rounded bg-[#0005] p-1"
              aria-label="Close fullscreen"
            >
              <X/>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
