'use client';

import { useState } from 'react';
import Script from 'next/script';
import { UserRound, Mail, Phone, MapPin, FileText, Wrench, Calendar } from 'lucide-react';

const SERVICE_TYPES = [
  { value: '', label: 'Select a service…' },
  { value: 'lawn-care', label: 'Lawn Care' },
  { value: 'landscaping', label: 'Landscaping' },
  { value: 'hardscape', label: 'Hardscape (Patios, Walkways, Walls)' },
  { value: 'tree-stump', label: 'Tree Service / Stump Grinding' },
  { value: 'decks-railings', label: 'Decks & Aluminum Railings' },
  { value: 'other', label: 'Other / Not Sure' },
];

export default function QuoteForm() {
  const [formData, setFormData] = useState({});
  const [status, setStatus] = useState(null);

  function handleChange(e) {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('Sending…');

    const token = process.env.NEXT_PUBLIC_SKIP_RECAPTCHA === 'true'
      ? 'dev-bypass'
      : await grecaptcha.execute(process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY, { action: 'submit' });

    const res = await fetch('/api/send-quote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...formData, token }),
    });

    const result = await res.json();
    if (result.success) {
      setStatus('Your request was sent! We\'ll be in touch soon.');
      document.querySelector('form')?.reset();
      setFormData({});
      setTimeout(() => setStatus(null), 5000);
    } else {
      setStatus('Error sending request. Please try calling us directly.');
    }
  }

  return (
    <>
      {process.env.NEXT_PUBLIC_SKIP_RECAPTCHA !== 'true' && (
        <Script
          src={`https://www.google.com/recaptcha/api.js?render=${process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}`}
          strategy="afterInteractive"
        />
      )}
      <form onSubmit={handleSubmit} className="space-y-6 w-full max-w-2xl lg:max-w-3xl mx-auto border border-gray-300 bg-white p-6 md:p-8 rounded shadow-lg">

        {/* Service type */}
        <div>
          <label htmlFor="serviceType" className="block font-medium text-gray-700 text-lg mb-1">Service Needed *</label>
          <div className="flex items-center border border-gray-300 rounded px-3 py-2 focus-within:ring-2 focus-within:ring-lime-400">
            <Wrench className="text-gray-500 mr-2 flex-shrink-0" size={20} />
            <select id="serviceType" name="serviceType" required onChange={handleChange}
              className="flex-1 outline-none bg-transparent text-base">
              {SERVICE_TYPES.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Name + Email */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Field label="Name" name="name" type="text" required placeholder="Full Name" icon={<UserRound />} onChange={handleChange} />
          <Field label="Email" name="email" type="email" required placeholder="you@example.com" icon={<Mail />} onChange={handleChange} />
        </div>

        {/* Phone + Desired Start */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Field label="Phone" name="phone" type="tel" placeholder="(555) 555-5555" icon={<Phone />} onChange={handleChange} />
          <div>
            <label htmlFor="startDate" className="block font-medium text-gray-700 text-lg mb-1">Desired Start Date</label>
            <div className="flex items-center border border-gray-300 rounded px-3 py-2 focus-within:ring-2 focus-within:ring-lime-400">
              <input id="startDate" name="startDate" type="date" onChange={handleChange}
                className="flex-1 outline-none bg-transparent text-base" />
              <Calendar className="ml-2 text-gray-500 flex-shrink-0" size={20} />
            </div>
          </div>
        </div>

        {/* Address */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Field label="Address" name="address" type="text" placeholder="123 Main St" icon={<MapPin />} onChange={handleChange} />
          <Field label="City" name="city" type="text" placeholder="City" onChange={handleChange} />
        </div>

        <div className="grid grid-cols-2 gap-6">
          <Field label="State" name="state" type="text" placeholder="PA" maxLength={2} onChange={handleChange} />
          <Field label="ZIP Code" name="zip" type="text" placeholder="12345" maxLength={10} onChange={handleChange} />
        </div>

        {/* Message */}
        <div>
          <label htmlFor="message" className="block font-medium text-gray-700 text-lg mb-1">Describe the Work *</label>
          <div className="flex items-start border border-gray-300 rounded px-3 py-2 focus-within:ring-2 focus-within:ring-lime-400">
            <textarea id="message" name="message" rows="4" required
              placeholder="Tell us about the project, size of area, any specific details…"
              onChange={handleChange}
              className="flex-1 outline-none bg-transparent resize-none text-base" />
            <FileText className="ml-2 text-gray-500 mt-1 flex-shrink-0" />
          </div>
        </div>

        <button type="submit"
          className="w-full bg-lime-600 hover:bg-lime-700 text-white text-lg font-semibold py-3 rounded transition">
          Request Free Estimate
        </button>

        {status && <p className="text-center text-gray-600">{status}</p>}
      </form>
    </>
  );
}

function Field({ label, name, type, placeholder, required = false, icon = null, maxLength, onChange }) {
  return (
    <div className="w-full overflow-hidden">
      <label htmlFor={name} className="block font-medium text-gray-700 text-lg mb-1">{label}</label>
      <div className="flex items-center border border-gray-300 rounded px-3 py-2 focus-within:ring-2 focus-within:ring-lime-400 divide-x-2 divide-gray-300">
        <input type={type} id={name} name={name} required={required} placeholder={placeholder}
          maxLength={maxLength} onChange={onChange}
          className={`w-full min-w-0 flex-1 outline-none bg-transparent text-base ${icon ? '' : 'pl-2'}`} />
        {icon && <span className="ml-2 text-gray-500">{icon}</span>}
      </div>
    </div>
  );
}
