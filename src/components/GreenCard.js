export default function GreenCard({ children }) {
	return (
		<div className="bg-green-600">
			<section className="max-w-6xl mx-auto p-6 py-12">
				<p className="text-white text-[20px] md:text-3xl text-center font-bold drop-shadow drop-shadow-black">
					{children}
				</p>
			</section>
		</div>
	)
}