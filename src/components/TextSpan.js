export default function TextSpan({ children }){
	return (
		<div className="max-w-6xl mx-auto p-6">
			<p className="text-[20px] md:text-2xl text-center">
				{children}
			</p>
		</div>
	);
};