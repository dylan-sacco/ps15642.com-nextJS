export default function H1Drop({
  children,
  size = 'text-3xl',
  color = 'text-lime-600',
  center = true,
  italic = false,
  className = '',
}) {
  const alignment = center ? 'justify-center' : '';
  const fontStyle = italic ? 'italic' : '';

  return (
    <div className={`relative flex ${alignment} ${className}`}>
      {/* Shadow Text Behind */}
      <h1 className={`${size} font-bold absolute text-black translate-x-[1.5px] translate-y-[1.5px] ${fontStyle}`}>
        {children}
      </h1>

      {/* Foreground Text */}
      <h1 className={`${size} font-bold ${color} relative ${fontStyle}`}>
        {children}
      </h1>
    </div>
  );
}
