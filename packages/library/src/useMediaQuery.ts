import { useEffect, useState } from "react";

type BreakpointName = "small" | "medium" | "large";

const BREAKPOINTS: Record<BreakpointName, string> = {
  small: "(max-width: 768px)",
  medium: "(max-width: 1024px)",
  large: "(min-width: 1025px)",
};

export function useMediaQuery(queryOrBreakpoint: string): boolean {
  const query = ((): string => {
    if (queryOrBreakpoint in BREAKPOINTS) {
      return BREAKPOINTS[queryOrBreakpoint as BreakpointName];
    }
    return queryOrBreakpoint;
  })();

  const getMatches = (): boolean => {
    if (
      typeof window === "undefined" ||
      typeof window.matchMedia === "undefined"
    ) {
      return false;
    }
    return window.matchMedia(query).matches;
  };

  const [matches, setMatches] = useState<boolean>(getMatches);

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      typeof window.matchMedia === "undefined"
    ) {
      return;
    }
    const mql = window.matchMedia(query);
    const onChange = () => setMatches(mql.matches);
    onChange();
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [query]);

  return matches;
}
