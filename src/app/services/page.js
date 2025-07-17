import GenericSpan from "@/components/GenericSpan";
import H1Drop from "@/components/H1Drop";
import ParallaxCard from "@/components/ParallaxCard";

// ✅ Metadata for SEO (App Router format)
export const metadata = {
  title: "Services | P&S Contracting and Landscape",
  description:
    "Explore our landscaping, hardscaping, drainage, and maintenance services tailored for homes and businesses in Westmoreland County, PA.",
  openGraph: {
    title: "Services | P&S Contracting and Landscape",
    description:
      "Professional landscaping, hardscaping, and maintenance services by P&S Contracting and Landscape.",
    url: "https://ps15642.com/services",
    siteName: "P&S Contracting and Landscape",
    images: [
      {
        url: "https://ps15642.com/hs1.jpg",
        width: 1800,
        height: 800,
        alt: "Our Services - P&S Contracting and Landscape",
      },
    ],
    locale: "en_US",
    type: "website",
  },
};

export default function servicePage() {
  const content = [
    {
      title: "Landscape Design-",
      content: "Choosing to upgrade a dismal or mundane landscape for your home or business is always best approached with the guidance of a professional. You're able to get ahead of potential pitfalls before they occur and you're able to manage your budget accurately. With our licensed professionals on hand, all of our custom landscape designs are personalized from client to client, thus ensuring originality. Having a truly exceptional landscape design can really make your home or office stand out, and goes a long way to providing serenity and comfort to your guests. Using only the latest and greatest in technical application and design-specific flora, our landscape designs are a cut above."
    }, {
      title: "Landscape Installation-",
      content: "Our landscaping roots date back generations. From humble beginnings to being the premier landscaping company in Western Pennsylvania, we have stayed true to the mantra that our hard work and attention to detail will be to the benefit of both our clients and our company respectively. Using the current techniques and applications in horticulture, we are able to do much more than simply planting shrubs. Our transplants and floral relocations are cutting-edge and we use only the choicest materials for our planting beds. With every one of our crewmembers having a deep understanding of plant growth, cycling and gestation, we are able to install foliage that will look amazing and have the added longevity of being cared for by professionals."
    }, {
      title: "Softscape Services-",
      content: "The importance of a properly designed, installed and maintained softscape is often overlooked. Considering it is the organic part of your landscaping design, it is crucial to utilize only the most optimal option in terms of flora, layout, irrigation and cultivation. Here at P&S Contracting and Landscape, we take the extra time and apply the extra effort to allow our customers to have their contributions to the softscape. Guided by our expertise and flair for diversity, it is no wonder we are widely regarded as the best overall landscaping service around! Unsure what setup or design type would be best suited for your home or office? Feel free to reach out to us!"
    },
  ]
  return (
    <div>
      <ParallaxCard imgUrl="/hs1.jpg">
        <div className="relative">
          {/* Shadow Text Behind */}
          <H1Drop color="text-white" size="text-4xl md:text-6xl">
            Our Services
          </H1Drop>
        </div>
      </ParallaxCard>
      {content.map((section, index) => {
        return (
          <GenericSpan title={section.title}>
            {section.content}
          </GenericSpan>
        )
      })}
    </div>
  );
}