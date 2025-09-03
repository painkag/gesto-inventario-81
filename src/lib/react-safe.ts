// Safe React import to ensure single instance
import * as ReactSafe from "react";

// Export React safely with proper typing
export const React = ReactSafe;

// Safe hooks - use original React hooks (they should work now with proper bundling)
export const useState = ReactSafe.useState;
export const useEffect = ReactSafe.useEffect;
export const useContext = ReactSafe.useContext;
export const createContext = ReactSafe.createContext;
export const useCallback = ReactSafe.useCallback;
export const useMemo = ReactSafe.useMemo;
export const useRef = ReactSafe.useRef;
export const useReducer = ReactSafe.useReducer;
export const forwardRef = ReactSafe.forwardRef;

// Ensure React is properly loaded
if (!ReactSafe.useState || !ReactSafe.useEffect) {
  console.error("React hooks not available - React may not be properly loaded");
}

// Export for default imports
export default ReactSafe;