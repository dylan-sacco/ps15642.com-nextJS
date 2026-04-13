import Link from "next/link";
import ScrollReveal from "./ScrollReveal";

export default function CardOverCard({zoomContainerList}) {
  return(
    <div className="relative" >
        {zoomContainerList.map((el) => (
          <div className="sticky top-0 h-screen w-screen flex " key={el.title}>
            <img 
              className="absolute top-0 h-screen w-screen object-cover"
              src={el.imageURL}/>
            <div className="absolute top-0 bg-black/65 w-screen h-screen" />
            <ScrollReveal className="relative flex flex-col m-auto text-white font-[Raleway] px-8 max-w-175 ">
              <h2 className="text-[4rem] font-[Playfair_Display] pb-6 text-base/16">
                {el.title}
              </h2>
              <p
                className="text-[2rem] pb-4"
              >{el.description}</p>
              <Link
              className=" underline hover:bg-white p-4 px-8 outline outline-white w-fit hover:text-black transition duration-[300ms]"
              // className=" underline hover:text-gray-200 hover:bg-gray-950/15 p-4 px-8 outline outline-white w-fit"
                href={el.buttonURL}>
                  {el.buttonText || "Learn More →"}
              </Link>
            </ScrollReveal>
          </div>
        ))}
      </div>
  )
}