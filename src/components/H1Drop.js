export default function H1Drop({ children, size = 'text-3xl' }) {
  return (
    <div className="relative flex justify-center">
      {/* Shadow Text Behind */}
      <h1 className={`${size} font-bold absolute text-black translate-x-[1.5px] translate-y-[1.5px]`}>
        {children}
      </h1>

      {/* Foreground Text */}
      <h1 className={`${size} font-bold text-lime-700 relative`}>
        {children}
      </h1>
    </div>
  );
}
