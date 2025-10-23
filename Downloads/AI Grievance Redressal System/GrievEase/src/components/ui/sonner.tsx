// GrievEase/src/components/ui/sonner.tsx

// "use client"; is optional but harmless in Vite/React
import * as React from "react"; 
import { Toaster as Sonner, ToasterProps } from "sonner";
// REMOVED: import { useTheme } from "next-themes"; <--- This was the crashing line

const Toaster = ({ ...props }: ToasterProps) => {
  // Use a sensible default theme, or remove this line entirely if
  // you just want the browser default.
  const theme = "light"; 

  return (
    <Sonner
      // Using the variable theme, which is now 'light'
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      // Assuming your Tailwind CSS variables are set up for styling
      style={
        {
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
