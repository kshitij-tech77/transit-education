// There's no separate "display name" field anywhere in this system (auth is
// email-OTP only, loyalty_members has no name column) — this is a best-
// effort heuristic over the email's local part, not real name data. If the
// local part doesn't yield a clean, plausible name (e.g. it's all digits, or
// what's left after stripping digits is too short), we deliberately give up
// rather than show a mangled fragment — a badly parsed name reads worse than
// no name at all.
function firstNameFromEmail(email: string | null): string | null {
  if (!email) return null;
  const local = email.split("@")[0];
  const letters = local.replace(/[^a-zA-Z]+/g, " ").trim().split(" ")[0];
  if (!letters || letters.length < 2) return null;
  return letters.charAt(0).toUpperCase() + letters.slice(1).toLowerCase();
}

interface WelcomeHeaderProps {
  email: string | null;
}

export function WelcomeHeader({ email }: WelcomeHeaderProps) {
  const name = firstNameFromEmail(email);

  return (
    <div>
      {name ? (
        <>
          <p className="text-sm text-gray-600">Welcome back,</p>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{name}! 👋</h1>
        </>
      ) : (
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Welcome back! 👋</h1>
      )}
      <p className="text-sm text-gray-600 mt-1">Keep going! You&apos;re doing great on your study abroad journey.</p>
    </div>
  );
}
