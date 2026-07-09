"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

// A slim top progress bar that animates on every route change,
// giving instant feedback so navigation never feels frozen.
export default function LoadingBar() {
  const pathname = usePathname();
  const [width, setWidth] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
    setWidth(30);
    const t1 = setTimeout(() => setWidth(70), 100);
    const t2 = setTimeout(() => setWidth(100), 300);
    const t3 = setTimeout(() => {
      setVisible(false);
      setWidth(0);
    }, 600);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [pathname]);

  if (!visible) return null;
  return <div className="route-loading-bar" style={{ width: `${width}%` }} />;
}