export default function TextSpan({ children }) {
  return (
    <div className="max-w-4xl mx-auto px-6 py-10 text-center">
      {/* Top accent */}
      <div className="flex items-center justify-center gap-3 mb-5" aria-hidden="true">
        <div className="h-px w-10 bg-lime-400/50" />
        <div className="w-2 h-2 rotate-45 bg-lime-500" />
        <div className="h-px w-10 bg-lime-400/50" />
      </div>

      <p className="text-xl md:text-2xl text-gray-700 leading-relaxed">
        {children}
      </p>

      {/* Bottom accent */}
      <div className="flex items-center justify-center gap-3 mt-5" aria-hidden="true">
        <div className="h-px w-10 bg-lime-400/50" />
        <div className="w-2 h-2 rotate-45 bg-lime-500" />
        <div className="h-px w-10 bg-lime-400/50" />
      </div>
    </div>
  );
}
