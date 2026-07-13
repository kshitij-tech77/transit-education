// There's no separate "display name" field anywhere in this system (auth is
// email-OTP only, loyalty_members has no name column) — this is a best-
// effort heuristic over the email's local part, not real name data.
function firstNameFromEmail(email: string | null): string {
  if (!email) return "there";
  const local = email.split("@")[0];
  const letters = local.replace(/[^a-zA-Z]+/g, " ").trim().split(" ")[0];
  const name = letters || local;
  return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
}

interface WelcomeHeaderProps {
  email: string | null;
}

export function WelcomeHeader({ email }: WelcomeHeaderProps) {
  return (
    <div>
      <p className="text-[13px] text-gray-400">Welcome back,</p>
      <h1 className="text-[24px] font-extrabold text-[#111]">{firstNameFromEmail(email)}!</h1>
      <p className="text-[13px] text-gray-500 mt-1">Keep going! You&apos;re doing great on your study abroad journey.</p>
    </div>
  );
}
