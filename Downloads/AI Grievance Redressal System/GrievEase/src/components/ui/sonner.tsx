// Remove: import { useTheme } from "next-themes"; 
import { Toaster as Sonner, ToasterProps } from "sonner";
import * as React from "react"; // Added to correctly scope React

const Toaster = ({ ...props }: ToasterProps) => {
  // Hardcode theme instead of reading from useTheme()
  const theme = "light"; 

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
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