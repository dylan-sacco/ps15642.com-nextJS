import nodemailer from 'nodemailer';
import { addSubmission } from '@/lib/contactSubmissions';

export async function POST(req) {
  const data = await req.json();
  const { name, email, phone, address, city, state, zip, message, token } = data;

  // Verify reCAPTCHA (set SKIP_RECAPTCHA=true in .env.local to bypass during development)
  if (process.env.SKIP_RECAPTCHA === 'true') {
    console.log('[dev] reCAPTCHA check skipped (SKIP_RECAPTCHA=true)');
  } else {
    const verifyRes = await fetch(`https://www.google.com/recaptcha/api/siteverify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${token}`,
    });

    const verifyData = await verifyRes.json();

    if (!verifyData.success || verifyData.score < 0.5) {
      return new Response(JSON.stringify({ success: false, error: 'Failed reCAPTCHA' }), { status: 400 });
    }
  }

  // Persist submission before sending email so nothing is lost on email failure
  try {
    addSubmission({ name, email, phone, address, city, state, zip, message });
  } catch (err) {
    console.error('Failed to save contact submission:', err);
  }

  // Send email (set SKIP_EMAIL=true in .env.local to log instead of sending during development)
  if (process.env.SKIP_EMAIL === 'true') {
    console.log('[dev] Email send skipped (SKIP_EMAIL=true). Would have sent:');
    console.log(`  To:      ${process.env.EMAIL_USER}`);
    console.log(`  Name:    ${name}`);
    console.log(`  Email:   ${email}`);
    console.log(`  Phone:   ${phone}`);
    console.log(`  Address: ${address}, ${city}, ${state} ${zip}`);
    console.log(`  Message: ${message}`);
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `"Contact Form" <${process.env.EMAIL_USER}>`,
    to: process.env.EMAIL_USER,
    // to: 'dmsacco0807@gmail.com',
    subject: 'New Contact Form Submission',
    text: `
Name: ${name}
Email: ${email}
Phone: ${phone}
Address: ${address}
City: ${city}
State: ${state}
ZIP: ${zip}
Message: ${message}
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error('Email error:', error);
    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500 });
  }
}
