/**
 * Loyalty program constants and helpers shared between the portal
 * auth-bootstrap route and (future) admin rule editing.
 */

// Referral reward is split in two: a small instant reward for the signup
// itself, and a larger bonus once the referred person is actually linked to
// a real student/lead record (see student_id on loyalty_members). This ties
// most of the reward to real business value instead of a bare email signup.
export const REFERRAL_SIGNUP_POINTS = 25;
export const REFERRAL_CONVERSION_POINTS = 75;

const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I — avoids OTP-style ambiguity

export function generateReferralCode(length = 7): string {
  let code = "";
  for (let i = 0; i < length; i++) {
    code += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
  }
  return code;
}
