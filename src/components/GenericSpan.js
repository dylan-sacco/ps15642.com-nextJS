import { Children } from "react";
import H1Drop from "./H1Drop";

export default function GenericSpan({title, children}) {
    return (
        <section section className="max-w-6xl mx-auto p-6" >
            <H1Drop className="pb-6" size="text-2xl md:text-5xl" center={false} italic={true}>
                {title}
            </H1Drop>
            <p className="md:text-[1.4rem]">{children}</p>
        </section >
    )
}