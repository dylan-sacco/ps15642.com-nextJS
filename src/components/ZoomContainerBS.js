export default function ZoomContainerBS({
  title = "Default Text",
  description = "Default Text",
  buttonText = "Learn More",
  buttonURL = "/",
  imageURL,
}) {
  return (
    <div className="relative group overflow-hidden rounded-lg shadow-md text-white text-center h-[300px]">
      {/* Background */}
      <div
        className="absolute inset-0 bg-center bg-cover bg-no-repeat transition-transform duration-500 scale-100 group-hover:scale-110"
        style={{ backgroundImage: `url('${imageURL || 'home-image-1.jpg'}')` }}
      />

      {/* Foreground Overlay */}
      <div className="relative z-10 h-full bg-black/50 flex items-center justify-center p-4">
        <div className="text-white text-center transition-all duration-500 ease-out transform group-hover:translate-y-0 translate-y-[40%] opacity-100 group-hover:opacity-100">
          <p className="text-2xl font-semibold mb-2">{title}</p>

          {/* Content that fades in on hover */}
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-500">
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
