import { NextResponse } from 'next/server';
import { Resend } from 'resend';

// In-memory rate limiter: max 5 submissions per IP per hour.
const rateLimitMap = new Map<string, number[]>();
function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const window = 60 * 60 * 1000;
  const attempts = (rateLimitMap.get(ip) ?? []).filter(t => now - t < window);
  if (attempts.length >= 5) return false;
  rateLimitMap.set(ip, [...attempts, now]);
  return true;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

export async function POST(req: Request) {
  const ip = (req.headers.get('x-forwarded-for') ?? '').split(',')[0].trim() || '127.0.0.1';
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  try {
    const { name, email, message } = await req.json();

    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return NextResponse.json({ error: 'All fields are required.' }, { status: 400 });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim()) || /[\r\n]/.test(email)) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
    }

    const safeName = escapeHtml(name.trim());
    const safeEmail = escapeHtml(email.trim());
    const safeMessage = escapeHtml(message.trim());

    const { error } = await resend.emails.send({
      from: 'Discover Florida Parks <noreply@discoverfloridaparks.com>',
      to: 'hello@discoverfloridaparks.com',
      replyTo: email,
      subject: `Contact form: ${name}`,
      text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #362f35;">New message from ${safeName}</h2>
          <p style="color: #726d6b;"><strong>Email:</strong> <a href="mailto:${safeEmail}">${safeEmail}</a></p>
          <hr style="border: none; border-top: 1px solid #eeeeee; margin: 20px 0;" />
          <p style="color: #413734; line-height: 1.6; white-space: pre-wrap;">${safeMessage}</p>
        </div>
      `,
    });

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json({ error: 'Failed to send message.' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Contact form error:', err);
    return NextResponse.json({ error: 'Unexpected error.' }, { status: 500 });
  }
}
