'use client';
import { X, Play, Maximize } from 'lucide-react';
import { useState, useRef, useEffect, useCallback } from 'react';

export default function Gallery({ images, showAltText = false, pageSize = 24 }) {
  const [visibleCount, setVisibleCount] = useState(pageSize);
  const [selected, setSelected] = useState(null);
  const [loadedVideos, setLoadedVideos] = useState(new Set());
  const mediaRef = useRef(null);

  const visibleImages = images.slice(0, visibleCount);
  const hasMore = visibleCount < images.length;

  const navigate = useCallback((dir) => {
    if (!selected) return;
    const idx = images.findIndex(img => img.src === selected.src);
    const next = idx + dir;
    if (next < 0 || next >= images.length) return;
    // Auto-expand visible set when navigating beyond the current page
    if (next >= visibleCount) {
      setVisibleCount(c => Math.min(c + pageSize, images.length));
    }
    setSelected(images[next]);
  }, [selected, images, visibleCount, pageSize]);

  useEffect(() => {
    if (!selected) return;
    function onKey(e) {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') navigate(1);
      if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')   navigate(-1);
      if (e.key === 'Escape') setSelected(null);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selected, navigate]);

  function markLoaded(src) {
    setLoadedVideos(prev => new Set([...prev, src]));
  }

  function openFullscreen() {
    const el = mediaRef.current;
    if (!el) return;
    if (el.requestFullscreen) el.requestFullscreen();
    else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-6xl mx-auto p-4">
        {visibleImages.map((item, i) => (
          <div
            key={i}
            className="cursor-pointer overflow-hidden rounded-lg shadow-lg"
            onClick={() => setSelected(item)}
          >
            <div className="aspect-square relative">
              {item.isVideo ? (
                <>
                  {item.poster ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={item.poster}
                      alt={item.alt || `Gallery video ${i + 1}`}
                      className="absolute inset-0 w-full h-full object-cover rounded-lg hover:scale-105 transition-transform duration-300"
                      loading={i < 6 ? 'eager' : 'lazy'}
                    />
                  ) : (
                    /* No thumbnail — load video metadata so browser can show first frame */
                    <>
                      {!loadedVideos.has(item.src) && (
                        <div className="absolute inset-0 bg-gray-800 rounded-lg flex items-center justify-center z-10 pointer-events-none">
                          <div className="w-8 h-8 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                        </div>
                      )}
                      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
                      <video
                        src={item.src}
                        muted
                        preload="metadata"
                        className="absolute inset-0 w-full h-full object-cover rounded-lg hover:scale-105 transition-transform duration-300"
                        onLoadedData={() => markLoaded(item.src)}
                      />
                    </>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="bg-black/50 rounded-full p-3">
                      <Play className="w-8 h-8 text-white fill-white" />
                    </div>
                  </div>
                </>
              ) : (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={item.thumbUrl || item.src}
                  alt={item.alt || `Gallery image ${i + 1}`}
                  className="absolute inset-0 w-full h-full object-cover rounded-lg hover:scale-105 transition-transform duration-300"
                  loading={i < 6 ? 'eager' : 'lazy'}
                />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Pagination footer */}
      {images.length > 0 && (
        <div className="flex flex-col items-center gap-3 py-8">
          <p className="text-sm text-gray-400">
            Showing {Math.min(visibleCount, images.length)} of {images.length}
          </p>
          {hasMore && (
            <button
              onClick={() => setVisibleCount(c => Math.min(c + pageSize, images.length))}
              className="px-6 py-2 bg-lime-600 hover:bg-lime-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Load More
            </button>
          )}
        </div>
      )}

      {/* Fullscreen Modal */}
      {selected && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="relative max-w-5xl max-h-[90vh] flex flex-col items-center justify-center"
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setSelected(null)}
              className="absolute -top-3 -right-3 z-10 bg-white rounded-full w-7 h-7 flex items-center justify-center text-gray-600 hover:text-gray-900 shadow-lg text-sm font-bold"
              aria-label="Close fullscreen"
            >
              <X size={14} />
            </button>

            {selected.isVideo ? (
              /* eslint-disable-next-line jsx-a11y/media-has-caption */
              <video
                ref={mediaRef}
                src={selected.src}
                poster={selected.poster}
                controls
                autoPlay
                className="max-w-full max-h-[85vh] rounded-lg shadow-2xl"
                onClick={e => e.stopPropagation()}
              />
            ) : (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                ref={mediaRef}
                src={selected.src}
                alt={selected.alt || 'Fullscreen view'}
                className="max-w-full max-h-[85vh] rounded-lg shadow-2xl object-contain"
              />
            )}

            <button
              onClick={openFullscreen}
              className="absolute top-8 -right-3 z-10 bg-white rounded-full w-7 h-7 flex items-center justify-center text-gray-600 hover:text-gray-900 shadow-lg"
              title="Full screen"
            >
              <Maximize size={14} />
            </button>

            {showAltText && selected.alt && (
              <p className="mt-3 text-white/80 text-sm text-center max-w-lg">{selected.alt}</p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
