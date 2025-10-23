import { Toaster as Sonner, ToasterProps } from "sonner";
import * as React from "react"; // Ensure React is imported if needed

// Note: Removed the import: import { useTheme } from "next-themes";

const Toaster = ({ ...props }: ToasterProps) => {
  // Hardcode theme or use a simple state management hook instead of next-themes
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