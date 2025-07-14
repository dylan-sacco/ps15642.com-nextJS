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
        style={{ backgroundImage: `url('${imageURL ? imageURL : 'home-image-1.jpg'}')` }}
      />

      {/* Foreground Content */}
      <div className="relative z-10 h-full bg-black/50 px-4 flex items-center justify-center">
        {/* Inner wrapper to handle positioning */}
        <div className="relative w-full text-center">
          {/* Title */}
          <p
            className="
              text-2xl font-semibold absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2
              transition-all duration-500
              group-hover:-translate-y-[7rem]
            "
          >
            {title}
          </p>

          {/* Hover Content */}
          <div className="
            opacity-0 translate-y-6 group-hover:opacity-100 group-hover:-translate-y-6
            transition-all duration-500 flex flex-col items-center gap-2 pt-24
          ">
            <hr className="w-full border-white/50 border-dashed border-[2px]" />
            <p className="p-2">{description}</p>
            <hr className="w-full border-white/50 mb-4 border-dashed border-[2px]" />
            <a href={buttonURL}>
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
