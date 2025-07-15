'use client';
import { useState } from 'react';
import { UserRound, Mail, Phone, MapPin, FileText } from "lucide-react";
import Script from 'next/script';

export default function ContactForm() {
  const [formData, setFormData] = useState({});
  const [status, setStatus] = useState(null);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('Sending...');

    const token = await grecaptcha.execute(process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY, {
      action: 'submit',
    });

    const res = await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...formData, token }),
    });

    const result = await res.json();
    if (result.success) {
      setStatus('Message sent successfully!');
    } else {
      setStatus('Error sending message.');
    }
  };


  return (
    <>
      <Script
        src={`https://www.google.com/recaptcha/api.js?render=${process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}`}
        strategy="afterInteractive"
      />
      <form onSubmit={handleSubmit} className="space-y-6 w-full max-w-2xl lg:max-w-4xl xl:max-w-5xl mx-auto border border-gray-300 bg-white p-6 md:p-8 rounded shadow-lg">
        <input type="text" name="_gotcha" className="hidden" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField label="Name" icon={<UserRound />} id="name" type="text" required placeholder="Full Name" onChange={handleChange} />
          <FormField label="Email" icon={<Mail />} id="email" type="email" required placeholder="you@example.com" onChange={handleChange} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField label="Phone" icon={<Phone />} id="phone" type="tel" placeholder="(555) 555-5555" onChange={handleChange} />
          <FormField label="Address" icon={<MapPin />} id="address" type="text" placeholder="123 Main St" onChange={handleChange} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FormField label="City" id="city" type="text" placeholder="City" onChange={handleChange} />
          <FormField label="State" id="state" type="text" placeholder="PA" maxLength={2} onChange={handleChange} />
          <FormField label="ZIP Code" id="zip" type="text" placeholder="12345" maxLength={10} onChange={handleChange} />
        </div>

        <div>
          <label htmlFor="message" className="block font-medium text-gray-700 text-lg mb-1">Message</label>
          <div className="flex items-start border border-gray-300 rounded px-3 py-2 focus-within:ring-2 focus-within:ring-lime-400">
            <textarea
              id="message"
              name="message"
              rows="4"
              placeholder="Tell us more..."
              onChange={handleChange}
              className="flex-1 outline-none bg-transparent resize-none text-base"
            />
            <FileText className="ml-2 text-gray-500 mt-1" />
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-lime-600 hover:bg-lime-700 text-white text-lg font-semibold py-3 rounded transition"
        >
          Submit
        </button>

        {status && <p className="text-center text-gray-600">{status}</p>}
      </form>
    </>
  );
}

function FormField({ label, id, type, placeholder, required = false, icon = null, maxLength, onChange }) {
  return (
    <div>
      <label htmlFor={id} className="block font-medium text-gray-700 text-lg mb-1">{label}</label>
      <div className="flex items-center border border-gray-300 rounded px-3 py-2 focus-within:ring-2 focus-within:ring-lime-400 divide-x-2 divide-gray-300">
        <input
          type={type}
          id={id}
          name={id}
          required={required}
          placeholder={placeholder}
          maxLength={maxLength}
          onChange={onChange}
          className="flex-1 outline-none bg-transparent text-base"
        />
        {icon && <span className="ml-2 text-gray-500">{icon}</span>}
      </div>
    </div>
  );
}
