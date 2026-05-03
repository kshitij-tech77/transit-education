import Link from "next/link";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

// Simple SVG icons kept inline to avoid new icon libraries
const icons = {
  blog: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19 10H5m14 4H5m7 4H5"
      />
    </svg>
  ),
  faq: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h8M8 16h4" />
      <circle cx={12} cy={12} r={10} />
    </svg>
  ),
  // Add more icons as needed – using the same stroke style as project UI
};

export default function CmsSidebar() {
  const modules = [
    { name: "Blog", href: "/cms/blog", icon: icons.blog },
    { name: "FAQ", href: "/cms/faq", icon: icons.faq },
    // placeholders for remaining modules – they will be added later
  ];

  return (
    <aside className="h-full flex flex-col bg-gray-100 border-r border-gray-200 p-4">
      <nav className="flex-1 space-y-2">
        {modules.map((m) => (
          <Link
            key={m.name}
            href={m.href}
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "w-full justify-start gap-2 px-3 py-2 text-left"
            )}
          >
            {m.icon}
            <span>{m.name}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}
