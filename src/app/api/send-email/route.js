import nodemailer from 'nodemailer';

export async function POST(req) {
  const data = await req.json();
  const { name, email, phone, address, city, state, zip, message, token } = data;

  // Verify reCAPTCHA
  const verifyRes = await fetch(`https://www.google.com/recaptcha/api/siteverify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${token}`,
  });

  const verifyData = await verifyRes.json();

  if (!verifyData.success || verifyData.score < 0.5) {
    return new Response(JSON.stringify({ success: false, error: 'Failed reCAPTCHA' }), { status: 400 });
  }

  // Send email
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
