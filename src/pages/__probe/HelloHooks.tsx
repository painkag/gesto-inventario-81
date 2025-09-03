import React, { useState } from "react";

export default function HelloHooks() {
  const [n, setN] = useState(0);
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-bold text-foreground">React Hooks Test</h1>
        <button
          onClick={() => setN(n + 1)}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          Counter: {n}
        </button>
        <p className="text-muted-foreground">
          If this counter increments, React hooks are working correctly.
        </p>
      </div>
    </div>
  );
}