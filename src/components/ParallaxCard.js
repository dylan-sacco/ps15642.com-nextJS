export default function ParallaxCard({ imgUrl, children }) {
  return (
    <div className="h-[150px] md:h-[400px] bg-fixed bg-center bg-cover " style={{ backgroundImage: `url('${imgUrl}')` }}>
        <div className="h-full w-full  bg-opacity-40 flex flex-col items-center justify-center drop-shadow-lg bg-[#0005] text-white text-center">
          {children}
          {/* <h1 className="text-white text-4xl font-bold">P & S</h1>
          <p className="text-white text-2xl">Contracting and Landscape</p> */}
        </div>
      </div>
  );
}
