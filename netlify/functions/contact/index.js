const nodemailer = require('nodemailer');

const SERVICE_LABELS = {
  'leadership-management-edi': 'Leadership, Management and EDI',
  'customer-service-excellence': 'Customer Service Excellence',
  'training-design-delivery': 'Training Design & Delivery',
  'e-learning': 'E-Learning Solutions',
  'assessment-quality': 'Assessment & Quality Services',
  'other': 'Other',
};

const REGION_LABELS = {
  'uk': 'United Kingdom',
  'kenya': 'Kenya',
  'uganda': 'Uganda',
  'tanzania': 'Tanzania',
  'rwanda': 'Rwanda',
  'other-east-africa': 'Other East Africa',
  'other': 'Other',
};

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const params = new URLSearchParams(event.body);

  // Honeypot spam check
  if (params.get('bot-field')) {
    return { statusCode: 302, headers: { Location: '/contact/success/' }, body: '' };
  }

  const firstName   = params.get('first_name') || '';
  const lastName    = params.get('last_name') || '';
  const email       = params.get('email') || '';
  const phoneCode   = params.get('phone_code') || '';
  const phone       = params.get('phone') || '';
  const organisation = params.get('organisation') || '';
  const service     = SERVICE_LABELS[params.get('service')] || params.get('service') || 'Not specified';
  const region      = REGION_LABELS[params.get('region')] || params.get('region') || 'Not specified';
  const message     = params.get('message') || '';

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: 465,
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const mailOptions = {
    from: `"RD Learning Website" <${process.env.SMTP_USER}>`,
    to: process.env.SMTP_USER,
    replyTo: email,
    subject: `New enquiry from ${firstName} ${lastName}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
        <h2 style="color:#1a2e44;border-bottom:2px solid #2d6a4f;padding-bottom:8px;">New Enquiry — RD Learning &amp; Consulting</h2>
        <table style="width:100%;border-collapse:collapse;">
          <tr><td style="padding:8px 0;color:#666;width:160px;">Name</td><td style="padding:8px 0;font-weight:bold;">${firstName} ${lastName}</td></tr>
          <tr><td style="padding:8px 0;color:#666;">Email</td><td style="padding:8px 0;"><a href="mailto:${email}">${email}</a></td></tr>
          <tr><td style="padding:8px 0;color:#666;">Phone</td><td style="padding:8px 0;">${phoneCode} ${phone}</td></tr>
          <tr><td style="padding:8px 0;color:#666;">Organisation</td><td style="padding:8px 0;">${organisation || '—'}</td></tr>
          <tr><td style="padding:8px 0;color:#666;">Service</td><td style="padding:8px 0;">${service}</td></tr>
          <tr><td style="padding:8px 0;color:#666;">Region</td><td style="padding:8px 0;">${region}</td></tr>
        </table>
        ${message ? `<h3 style="color:#1a2e44;margin-top:24px;">Message</h3><p style="background:#f5f5f5;padding:16px;border-radius:6px;">${message.replace(/\n/g, '<br>')}</p>` : ''}
        <p style="color:#999;font-size:12px;margin-top:32px;">Sent from the contact form at rdlearningconsulting.com</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return {
      statusCode: 302,
      headers: { Location: '/contact/success/' },
      body: '',
    };
  } catch (err) {
    console.error('Mail error:', err);
    return {
      statusCode: 302,
      headers: { Location: '/contact/?error=1' },
      body: '',
    };
  }
};
