import { React } from "@/lib/react-safe"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  try {
    // Safe React hooks usage with fallback
    const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

    React.useEffect(() => {
      // Safe implementation with error handling
      try {
        const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
        const onChange = () => {
          setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
        }
        mql.addEventListener("change", onChange)
        setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
        return () => mql.removeEventListener("change", onChange)
      } catch (error) {
        console.warn('Error in useIsMobile:', error);
        // Fallback to desktop
        setIsMobile(false);
      }
    }, [])

    return !!isMobile
  } catch (error) {
    console.error('Error in useIsMobile hook:', error);
    // Safe fallback for mobile detection
    return window.innerWidth < MOBILE_BREAKPOINT;
  }
}