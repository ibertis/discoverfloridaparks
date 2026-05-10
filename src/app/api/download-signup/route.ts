import { NextResponse } from 'next/server';
import { Resend } from 'resend';

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

const PDF_URL = 'https://discoverfloridaparks.com/downloads/2026-florida-travel-trends.pdf';

export async function POST(req: Request) {
  const resend = new Resend(process.env.RESEND_API_KEY);

  try {
    const { name, email } = await req.json();

    if (!name?.trim() || !email?.trim()) {
      return NextResponse.json({ error: 'Name and email are required.' }, { status: 400 });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
    }

    const firstName = escapeHtml(name.trim().split(' ')[0]);

    // Email to the subscriber
    const { error: deliveryError } = await resend.emails.send({
      from: 'Discover Florida Parks <noreply@discoverfloridaparks.com>',
      to: email,
      subject: "Your 2026 Florida Travel Trends Guide is here 🌴",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
          <div style="background: #362f35; padding: 40px 40px 32px; text-align: center;">
            <p style="font-family: sans-serif; font-size: 13px; font-weight: 700; color: rgba(255,255,255,0.5); text-transform: uppercase; letter-spacing: 0.12em; margin: 0 0 12px;">Discover Florida Parks</p>
            <h1 style="font-family: sans-serif; font-size: 28px; font-weight: 900; color: #ffffff; margin: 0 0 8px; line-height: 1.1;">Your guide is ready, ${firstName}!</h1>
            <div style="width: 40px; height: 3px; background: #ff7044; border-radius: 2px; margin: 16px auto 0;"></div>
          </div>

          <div style="padding: 40px 40px 32px;">
            <p style="font-size: 15px; color: #413734; line-height: 1.7; margin: 0 0 24px;">
              Thanks for signing up. Your copy of the <strong>2026 Florida Travel Trends Guide</strong> is attached below — we hope it helps you plan your best Florida adventures yet.
            </p>

            <div style="text-align: center; margin: 32px 0;">
              <a href="${PDF_URL}" style="display: inline-block; background: #ff7044; color: #ffffff; text-decoration: none; font-weight: 700; font-size: 15px; padding: 16px 40px; border-radius: 40px;">
                Download Your Guide →
              </a>
            </div>

            <hr style="border: none; border-top: 1px solid #eeeeee; margin: 32px 0;" />

            <p style="font-size: 13px; color: #a6967c; line-height: 1.6; margin: 0;">
              You're receiving this because you signed up at <a href="https://discoverfloridaparks.com/travel-trends" style="color: #ff7044;">discoverfloridaparks.com</a>. We'll never share your email or send you spam.
            </p>
          </div>
        </div>
      `,
    });

    if (deliveryError) {
      console.error('Resend delivery error:', deliveryError);
      return NextResponse.json({ error: 'Failed to send email.' }, { status: 500 });
    }

    // Notify site owner of new lead
    await resend.emails.send({
      from: 'Discover Florida Parks <noreply@discoverfloridaparks.com>',
      to: 'hello@discoverfloridaparks.com',
      subject: `New lead: ${name} downloaded the 2026 Travel Trends Guide`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #362f35;">New Travel Trends download</h2>
          <p style="color: #726d6b;"><strong>Name:</strong> ${escapeHtml(name)}</p>
          <p style="color: #726d6b;"><strong>Email:</strong> <a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></p>
        </div>
      `,
      text: `New Travel Trends download\nName: ${name}\nEmail: ${email}`,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Download signup error:', err);
    return NextResponse.json({ error: 'Unexpected error.' }, { status: 500 });
  }
}
