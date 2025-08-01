import ContactForm from "@/components/ContactForm";
import { UserRound, Mail, Phone, FileText } from "lucide-react";

export const metadata = {
  title: "Contact Us | P&S Contracting and Landscape",
  description:
    "Get in touch with P&S Contracting and Landscape for quotes, inquiries, and service appointments in Westmoreland County, PA.",
  openGraph: {
    title: "Contact Us | P&S Contracting and Landscape",
    description:
      "Reach out to P&S Contracting and Landscape for expert landscaping services.",
    url: "https://ps15642.com/contact",
    siteName: "P&S Contracting and Landscape",
    images: [
      {
        url: "https://ps15642.com/hs1.webp",
        width: 1800,
        height: 800,
        alt: "Contact P&S Contracting and Landscape",
      },
    ],
    locale: "en_US",
    type: "website",
  },
};


export default function ContactPage() {
  return (
    <div className="space-y-8">
      {/* Google Maps Embed */}
      <iframe
        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d194818.695804261!2d-79.73571386066264!3d40.274814516317065!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8834dce6bed743c3%3A0xbfe5172f16e8dbeb!2sP%26S%20Contracting%20and%20Landscape!5e0!3m2!1sen!2sus!4v1752249178647!5m2!1sen!2sus"
        allowFullScreen={false}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className="w-full h-[300px] md:h-[400px]"
      ></iframe>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 p-4 max-w-7xl mx-auto">
        {/* Contact Info */}
        <section className="space-y-4 text-center xl:text-left ">
          <h1 className="text-[3rem] font-bold">Find Us</h1>
          <p className="text-[1.5rem]">Irwin, Pennsylvania</p>
          <a
            href="tel:7243828201"
            className="flex justify-center xl:justify-start items-center gap-2 text-[1.5rem] text-blue-600 hover:underline"
          >
            <Phone size={30} /> (724) 382-8201
          </a>

          <a
            href="mailto:psContractingAndLandscape@gmail.com"
            className="flex justify-center xl:justify-start items-center gap-2 md:text-[1.5rem] text-blue-600 hover:underline break-all"
          >
            <Mail size={30} /> pscontractingandlandscape@gmail.com
          </a>


        </section>

        {/* Contact Form */}
        <section className="w-full max-w-xl mx-auto">
          <h2 className="text-[3rem] font-bold mb-4 text-center xl:text-left">Contact Us</h2>
          <ContactForm />
        </section>
      </div>



    </div>
  );
}
