/**
 * Loyalty program constants and helpers shared between the portal
 * auth-bootstrap route and (future) admin rule editing.
 */

export const REFERRAL_SIGNUP_POINTS = 100;

const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I — avoids OTP-style ambiguity

export function generateReferralCode(length = 7): string {
  let code = "";
  for (let i = 0; i < length; i++) {
    code += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
  }
  return code;
}
