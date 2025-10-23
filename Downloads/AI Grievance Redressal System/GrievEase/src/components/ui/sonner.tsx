// The problem line MUST BE GONE: import { useTheme } from "next-themes"; 
import { Toaster as Sonner, ToasterProps } from "sonner";
import * as React from "react"; 
// This is the correct, simple Vite/React version:

const Toaster = ({ ...props }: ToasterProps) => {
  // Hardcode theme since useTheme is removed
  const theme = "light"; 

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      style={
        {
          // ... styling variables
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
