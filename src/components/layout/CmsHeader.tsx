import Link from "next/link";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export default function CmsHeader() {
  return (
    <header className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-3 shadow-sm">
      <h1 className="text-xl font-semibold text-gray-800">Transit Education CMS</h1>
      <Link
        href="/"
        className={cn(
          buttonVariants({ variant: "secondary", size: "sm" })
        )}
      >
        View Site ↗
      </Link>
    </header>
  );
}
