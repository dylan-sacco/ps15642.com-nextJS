import ParallaxCard from "@/components/ParallaxCard";

export default function AboutPage() {
  return (
    <div>
      <ParallaxCard imgUrl="/hs1.jpg">
        <div className="relative">
          {/* Shadow Text Behind */}
          <h1 className="text-3xl font-bold absolute text-black translate-x-[2px] translate-y-[2px]">
            About P&S Contracting and Landscape
          </h1>
          {/* Foreground Text */}
          <h1 className="text-3xl font-bold text-white relative">
            About P&S Contracting and Landscape
          </h1>
        </div>
      </ParallaxCard>
      <section>
        <h1>Our Roots-</h1>
      <p>P&S Contracting and Landscape was created on the principle that our quality landscape designs would speak for itself and landscaping maintenance dependability is vital. Furthermore, our original and a unique approach to providing every client with these landscaping services is something we are very proud of. We cater to our landscaping clients and their projects as diligently as we would if they were our own home or business. Also offering other essential services such as softscaping and mulching, we are able to make your property immaculate and welcome to all. </p>
      </section>
      <section>
        <h1>Our Goals-</h1>
      <p>When you're in need of having your business' landscaping updated and modernized we are the best company in Westmoreland County, PA. Additionally, we have the necessary experience to quickly and efficiently service your home's current landscaping layout and/or work with you hand in hand with you entirely to guarantee your custom landscape design is completely satisfactory to you. Being licensed, bonded and insured, you can take solace in the fact that all of your landscaping services are being addressed by true professionals. We offer our very thorough and outstanding landscaping services at an unbeatable bargain. We also offer free estimates and proposals! As a well established, family owned and operated business that always contributes to our community, we happily offer competitive rates and top notch landscaping services. If you have any questions or are ready to schedule your initial appointment, please contact us.</p>
      </section>
    </div>
  );
}
