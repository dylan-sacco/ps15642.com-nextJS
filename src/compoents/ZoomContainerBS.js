export default function ZoomContainerBS({ title = "Default Text", description = "Default Text", buttonText ="Learn More", buttonURL ="/", imageURL }) {
  return (
        <div className="relative group overflow-hidden rounded-lg shadow-md text-white text-center  h-[300px]">
          {/* Zoomable Background */}
          <div
            className="absolute inset-0 bg-center bg-cover bg-no-repeat transition-transform duration-500 scale-100 group-hover:scale-110"
            style={{ backgroundImage: `url('${imageURL? imageURL: 'home-image-1.jpg'}')` }}
          ></div>

          {/* Foreground Content */}
          <div className="relative z-10 flex flex-col items-center justify-center bg-black/50 p-4 rounded h-full">
            <p className="absolute text-2xl font-semibold transition-all duration-500 opacity-100 group-hover:-translate-y-50 group-hover:opacity-0">
              {title}
            </p>

            {/* Animated Content */}
            <div className="relative z-10 flex flex-col items-center justify-center  p-4 rounded h-full text-center ">
              <div className="flex flex-col items-center gap-2 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100 opacity-0 translate-y-50">
                <p className="text-2xl font-semibold">{title}</p>
                <hr className="w-full border-white/50 border-dashed border-[2px]" />
                <p className="p-2">
                  {description}
                </p>
                <hr className="w-full border-white/50 mb-4 border-dashed border-[2px]" />
                <a href={buttonURL} className="text-white">
                    <button className="bg-lime-500 hover:bg-lime-600 text-white px-4 rounded transition">
                  {buttonText}
                </button>
                </a>
              </div>
            </div>

          </div>
        </div>
  );
}