import GenericSpan from "@/components/GenericSpan";
import H1Drop from "@/components/H1Drop";
import ParallaxCard from "@/components/ParallaxCard";

export default function AboutPage() {
  const content =[
    {
      title:"Our Roots-",
      content:"P&S Contracting and Landscape was created on the principle that our quality landscape designs would speak for itself and landscaping maintenance dependability is vital. Furthermore, our original and a unique approach to providing every client with these landscaping services is something we are very proud of. We cater to our landscaping clients and their projects as diligently as we would if they were our own home or business. Also offering other essential services such as softscaping and mulching, we are able to make your property immaculate and welcome to all."
    },
    {
      title: "Our Goals-",
      content: "When you're in need of having your business' landscaping updated and modernized we are the best company in Westmoreland County, PA. Additionally, we have the necessary experience to quickly and efficiently service your home's current landscaping layout and/or work with you hand in hand with you entirely to guarantee your custom landscape design is completely satisfactory to you. Being licensed, bonded and insured, you can take solace in the fact that all of your landscaping services are being addressed by true professionals. We offer our very thorough and outstanding landscaping services at an unbeatable bargain. We also offer free estimates and proposals! As a well established, family owned and operated business that always contributes to our community, we happily offer competitive rates and top notch landscaping services. If you have any questions or are ready to schedule your initial appointment, please contact us."
    }
  ]
  return (
    <div>
      <ParallaxCard imgUrl="/hs1.jpg">
        <div className="relative">
          {/* Shadow Text Behind */}
          <H1Drop color="text-white" size="text-3xl md:text-4xl">
            About P&S Contracting and Landscape
          </H1Drop>
        </div>
      </ParallaxCard>
      {content.map((section, index) => {
        return(
          <GenericSpan title={section.title}>
            {section.content}
          </GenericSpan>
        )
      })}
    </div>
  );
}
