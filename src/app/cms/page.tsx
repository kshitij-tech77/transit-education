"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CmsHome() {
  const router = useRouter();
  useEffect(() => {
    // redirect to the blog list as a default landing page
    router.replace("/cms/blog");
  }, [router]);

  return null; // nothing rendered; redirect occurs client‑side
}
