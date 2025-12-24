"use client";

import { createContext, useContext, useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

interface NavigationContextType {
  shouldAnimate: boolean;
}

const NavigationContext = createContext<NavigationContextType>({
  shouldAnimate: true,
});

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const previousPathRef = useRef<string>(pathname);
  const [shouldAnimate, setShouldAnimate] = useState(true);

  useEffect(() => {
    const previousPath = previousPathRef.current;

    // Check if we're transitioning to/from home page
    const isFromHome = previousPath === "/";
    const isToHome = pathname === "/";
    const isBetweenNonHomePages = previousPath !== "/" && pathname !== "/";

    // Only animate when going to or from home page
    // Don't animate when going between about/projects
    if (isBetweenNonHomePages) {
      setShouldAnimate(false);
    } else {
      setShouldAnimate(true);
    }

    // Update previous path
    previousPathRef.current = pathname;
  }, [pathname]);

  return (
    <NavigationContext.Provider value={{ shouldAnimate }}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  return useContext(NavigationContext);
}
