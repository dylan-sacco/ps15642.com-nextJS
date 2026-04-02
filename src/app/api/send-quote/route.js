import nodemailer from 'nodemailer';
import { addQuote } from '@/lib/quoteRequests';

const SERVICE_LABELS = {
  'lawn-care': 'Lawn Care',
  'landscaping': 'Landscaping',
  'hardscape': 'Hardscape',
  'tree-stump': 'Tree Service / Stump Grinding',
  'decks-railings': 'Decks & Railings',
  'other': 'Other',
};

export async function POST(req) {
  const data = await req.json();
  const { serviceType, name, email, phone, address, city, state, zip, startDate, message, token } = data;

  // Verify reCAPTCHA
  if (process.env.SKIP_RECAPTCHA === 'true') {
    console.log('[dev] reCAPTCHA check skipped (SKIP_RECAPTCHA=true)');
  } else {
    const verifyRes = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${token}`,
    });
    const verifyData = await verifyRes.json();
    if (!verifyData.success || verifyData.score < 0.5) {
      return new Response(JSON.stringify({ success: false, error: 'Failed reCAPTCHA' }), { status: 400 });
    }
  }

  // Persist before sending email
  try {
    addQuote({ serviceType, name, email, phone, address, city, state, zip, startDate, message });
  } catch (err) {
    console.error('Failed to save quote request:', err);
  }

  const serviceLabel = SERVICE_LABELS[serviceType] || serviceType || 'Not specified';

  if (process.env.SKIP_EMAIL === 'true') {
    console.log('[dev] Email send skipped (SKIP_EMAIL=true). Quote request from:', name, '| Service:', serviceLabel);
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });

  try {
    await transporter.sendMail({
      from: `"Quote Request" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: `New Quote Request — ${serviceLabel}`,
      text: `
Service: ${serviceLabel}
Name: ${name}
Email: ${email}
Phone: ${phone}
Address: ${address}, ${city}, ${state} ${zip}
Desired Start: ${startDate || 'Not specified'}
Message: ${message}
      `,
    });
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error('Quote email error:', error);
    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500 });
  }
}
