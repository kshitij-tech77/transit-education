// Contest custom JWT auth using Web Crypto API (no extra packages)
// Signs tokens with SUPABASE_SERVICE_ROLE_KEY as HMAC-SHA256 secret

export interface ContestTokenPayload {
  userId: string;
  email: string;
  iat: number;
  exp: number;
}

function base64urlEncode(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function base64urlEncodeStr(str: string): string {
  return base64urlEncode(new TextEncoder().encode(str).buffer as ArrayBuffer);
}

function base64urlDecode(str: string): Uint8Array {
  const padded = str.replace(/-/g, '+').replace(/_/g, '/');
  const padding = '='.repeat((4 - (padded.length % 4)) % 4);
  const binary = atob(padded + padding);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

async function getHmacKey(usage: KeyUsage): Promise<CryptoKey> {
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    [usage]
  );
}

export async function signContestToken(
  payload: Omit<ContestTokenPayload, 'iat' | 'exp'>
): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const fullPayload: ContestTokenPayload = {
    ...payload,
    iat: now,
    exp: now + 60 * 60 * 24 * 30, // 30 days
  };

  const header = base64urlEncodeStr(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = base64urlEncodeStr(JSON.stringify(fullPayload));
  const signingInput = `${header}.${body}`;

  const key = await getHmacKey('sign');
  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(signingInput)
  );

  return `${signingInput}.${base64urlEncode(signature)}`;
}

export async function verifyContestToken(
  token: string
): Promise<ContestTokenPayload | null> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [header, body, sig] = parts;
    const signingInput = `${header}.${body}`;

    const key = await getHmacKey('verify');
    const signatureBytes = base64urlDecode(sig);

    const valid = await crypto.subtle.verify(
      'HMAC',
      key,
      signatureBytes,
      new TextEncoder().encode(signingInput)
    );

    if (!valid) return null;

    const decoded = new TextDecoder().decode(base64urlDecode(body));
    const payload = JSON.parse(decoded) as ContestTokenPayload;

    if (payload.exp < Math.floor(Date.now() / 1000)) return null;

    return payload;
  } catch {
    return null;
  }
}

export async function getContestUserFromRequest(
  request: Request
): Promise<ContestTokenPayload | null> {
  // Try Authorization header
  const authHeader = request.headers.get('Authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return verifyContestToken(authHeader.slice(7));
  }

  // Try cookie header
  const cookieHeader = request.headers.get('cookie');
  if (cookieHeader) {
    const cookies = Object.fromEntries(
      cookieHeader.split(';').map(c => {
        const eqIdx = c.indexOf('=');
        const k = c.slice(0, eqIdx).trim();
        const v = c.slice(eqIdx + 1).trim();
        return [k, v];
      })
    );
    const sessionToken = cookies['contest_session'];
    if (sessionToken) return verifyContestToken(sessionToken);
  }

  return null;
}

export function generateOtp(): string {
  const digits = '0123456789';
  let otp = '';
  for (let i = 0; i < 6; i++) {
    otp += digits[Math.floor(Math.random() * 10)];
  }
  return otp;
}

export function generateOtpEmailHtml(otp: string, email: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Your Verification Code</title>
</head>
<body style="margin:0;padding:0;background-color:#0a0e1a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0a0e1a;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background-color:#111827;border-radius:16px;overflow:hidden;border:1px solid #1f2937;">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#1e3a8a 0%,#1d4ed8 50%,#0ea5e9 100%);padding:40px 40px 32px;text-align:center;">
              <div style="font-size:48px;margin-bottom:12px;">⚽</div>
              <p style="margin:0;color:#93c5fd;font-size:13px;font-weight:600;letter-spacing:3px;text-transform:uppercase;">Transit Education</p>
              <h1 style="margin:8px 0 0;color:#ffffff;font-size:26px;font-weight:700;">Predict &amp; Win</h1>
              <p style="margin:4px 0 0;color:#93c5fd;font-size:14px;">FIFA World Cup 2026</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              <p style="margin:0 0 8px;color:#9ca3af;font-size:14px;">Verification code for</p>
              <p style="margin:0 0 32px;color:#f9fafb;font-size:16px;font-weight:600;">${email}</p>

              <p style="margin:0 0 16px;color:#d1d5db;font-size:15px;">Your 6-digit verification code is:</p>

              <!-- OTP Box -->
              <div style="background:#0a0e1a;border:2px solid #2563eb;border-radius:12px;padding:24px;text-align:center;margin-bottom:24px;">
                <span style="font-size:48px;font-weight:800;letter-spacing:16px;color:#60a5fa;font-variant-numeric:tabular-nums;">${otp}</span>
              </div>

              <p style="margin:0 0 8px;color:#9ca3af;font-size:13px;">
                ⏱ This code expires in <strong style="color:#f9fafb;">10 minutes</strong>.
              </p>
              <p style="margin:0 0 32px;color:#9ca3af;font-size:13px;">
                🔒 Never share this code with anyone.
              </p>

              <div style="border-top:1px solid #1f2937;padding-top:24px;">
                <p style="margin:0 0 8px;color:#6b7280;font-size:13px;">🏆 Make predictions, earn points, win prizes worth up to <strong style="color:#fbbf24;">NPR 250,000</strong></p>
                <p style="margin:0;color:#6b7280;font-size:12px;">If you didn't request this code, you can safely ignore this email.</p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#0a0e1a;padding:24px 40px;border-top:1px solid #1f2937;">
              <p style="margin:0;color:#374151;font-size:12px;text-align:center;">
                Transit Education Pvt. Ltd. · Kathmandu, Nepal<br />
                <a href="https://transiteducation.com.np" style="color:#4b5563;text-decoration:none;">transiteducation.com.np</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
