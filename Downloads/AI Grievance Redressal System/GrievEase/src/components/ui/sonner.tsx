// The problem line MUST BE GONE or commented out:
// import { useTheme } from "next-themes"; 
import { Toaster as Sonner, ToasterProps } from "sonner";
import * as React from "react"; 

const Toaster = ({ ...props }: ToasterProps) => {
  // Hardcode the theme here instead of using useTheme()
  const theme = "light"; 

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      // ... rest of the code
    />
  );
};

export { Toaster };