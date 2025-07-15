'use client';
import { UserRound, Mail, Phone, MapPin, FileText } from "lucide-react";

export default function ContactForm() {
  return (
    <form className="space-y-6 w-full max-w-2xl lg:max-w-4xl xl:max-w-5xl mx-auto border border-gray-300 bg-white p-6 md:p-8 rounded shadow-lg">
      {/* Anti-spam honeypot */}
      <input type="text" name="_gotcha" className="hidden" />

      {/* Name & Email */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField label="Name" icon={<UserRound />} id="name" type="text" required placeholder="Full Name" />
        <FormField label="Email" icon={<Mail />} id="email" type="email" required placeholder="you@example.com" />
      </div>

      {/* Phone & Address */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField label="Phone" icon={<Phone />} id="phone" type="tel" placeholder="(555) 555-5555" />
        <FormField label="Address" icon={<MapPin />} id="address" type="text" placeholder="123 Main St" />
      </div>

      {/* City, State, ZIP */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <FormField label="City" id="city" type="text" placeholder="City" />
        <FormField label="State" id="state" type="text" placeholder="PA" maxLength={2} />
        <FormField label="ZIP Code" id="zip" type="text" placeholder="12345" maxLength={10} />
      </div>

      {/* Message */}
      <div>
        <label htmlFor="message" className="block font-medium text-gray-700 text-lg mb-1">Message</label>
        <div className="flex items-start border border-gray-300 rounded px-3 py-2 focus-within:ring-2 focus-within:ring-lime-400">
          <textarea
            id="message"
            name="message"
            rows="4"
            placeholder="Tell us more..."
            className="flex-1 outline-none bg-transparent resize-none text-base"
          />
          <FileText className="ml-2 text-gray-500 mt-1" />
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        className="w-full bg-lime-600 hover:bg-lime-700 text-white text-lg font-semibold py-3 rounded transition"
      >
        Submit
      </button>
    </form>
  );
}

function FormField({ label, id, type, placeholder, required = false, icon = null, maxLength }) {
  return (
    <div>
      <label htmlFor={id} className="block font-medium text-gray-700 text-lg mb-1">
        {label}
      </label>
      <div className="flex items-center border border-gray-300 rounded px-3 py-2 focus-within:ring-2 focus-within:ring-lime-400 divide-x-2 divide-gray-300">
        <input
          type={type}
          id={id}
          name={id}
          required={required}
          placeholder={placeholder}
          maxLength={maxLength}
          className="flex-1 outline-none bg-transparent text-base"
        />
        {icon && <span className="ml-2 text-gray-500">{icon}</span>}
      </div>
    </div>
  );
}
