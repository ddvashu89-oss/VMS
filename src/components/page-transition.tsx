"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { TopProgressBar } from "@/components/ui/loader";

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // Use a counter ref so each navigation gets a unique key — avoids
  // React's duplicate-key warning when two siblings both use `pathname`.
  const navCountRef = useRef(0);
  const prevPathRef = useRef(pathname);

  useEffect(() => {
    if (prevPathRef.current !== pathname) {
      navCountRef.current += 1;
      prevPathRef.current = pathname;
    }
  }, [pathname]);

  const navKey = navCountRef.current;

  return (
    <>
      {/* Progress bar gets a unique numeric key each navigation */}
      <TopProgressBar key={`bar-${navKey}`} duration={700} />

      {/* Page content fades/slides with pathname as key */}
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -15 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="h-full w-full"
      >
        {children}
      </motion.div>
    </>
  );
}
