import { Mail, Phone } from "lucide-react";
import { FaFacebookSquare, FaGoogle, FaInstagram } from "react-icons/fa";

export default function ContactBar () {
  return(
    <div className="flex flex-wrap justify-start md:justify-center gap-4 md:gap-12 p-4 text-white bg-gradient-to-t from-lime-600 to-lime-400 text-left">
      <div className="flex space-x-2 items-center text-white">
        <a href="https://www.facebook.com/PandSContractingandLandscape/" target="_blank" rel="noopener noreferrer" className="hover:text-lime-900 transition" >
          <FaFacebookSquare size={24} />
          <p hidden>FaceBook</p>
        </a>
        <a href="https://www.instagram.com/p.s.contracting/" target="_blank" rel="noopener noreferrer" className="hover:text-lime-900 transition">
          <FaInstagram size={24} />
          <p hidden>Instagram</p>
        </a>
        <a
          href="https://www.bbb.org/us/pa/irwin/profile/landscape-contractors/ps-contracting-and-landscape-0141-71031381"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-lime-900 transition font-serif text-3xl flex items-center"
          style={{ lineHeight: '24px', height: '24px' }}
          >
          <b>B</b>
        </a>
        <a href="https://goo.gl/maps/SYQwxzQwuiNtmQCDA" target="_blank" rel="noopener noreferrer" className="hover:text-lime-900 transition">
          <FaGoogle size={22} />
          <p hidden>Google</p>
        </a>
      </div>

      <a href="tel:+17243828201" className="flex items-center gap-2 hover:text-lime-700 transition">
        <Phone size={24} />
        <span>(724) 382-8201</span>
      </a>

      <a href="mailto:pscontractingandlandscape@gmail.com" className="flex items-center gap-2 hover:text-lime-900 transition">
        <Mail size={24} />
        <span>pscontractingandlandscape@gmail.com</span>
      </a>
    </div>
  )
}