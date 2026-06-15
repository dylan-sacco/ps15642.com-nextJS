'use client';

import { useState } from 'react';
import { Phone, TriangleAlert, X } from 'lucide-react';

export default function EmergencyDisclaimer() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="hover:text-lime-400 transition-colors cursor-pointer"
      >
        Emergency Services Available
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 relative"
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="bg-red-100 rounded-full p-2 flex-shrink-0">
                <TriangleAlert size={22} className="text-red-600" />
              </div>
              <h2 className="text-lg font-bold text-gray-900">Emergency Services</h2>
            </div>

            <p className="text-gray-700 text-sm leading-relaxed mb-4">
              If you or someone else is in <strong>immediate danger</strong>, please call{' '}
              <strong className="text-red-600">911</strong> first.
            </p>

            <p className="text-gray-600 text-sm leading-relaxed mb-4">
              We respond to storm damage and property emergencies on private residential
              and commercial properties. <strong>All emergency calls are billable</strong> —
              we are a private landscaping company, not a municipal service.
            </p>

            <p className="text-gray-600 text-sm leading-relaxed mb-6">
              For trees down on public roads or township property, please contact your
              local municipality.
            </p>

            <a
              href="tel:+17243828201"
              className="flex items-center justify-center gap-2 w-full bg-lime-700 hover:bg-lime-800 text-white font-semibold py-3 rounded-lg transition-colors"
            >
              <Phone size={18} />
              (724) 382-8201
            </a>
          </div>
        </div>
      )}
    </>
  );
}
