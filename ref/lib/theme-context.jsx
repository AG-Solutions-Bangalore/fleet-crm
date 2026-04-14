import React, { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "default");

  useEffect(() => {
    const root = document.documentElement;
  
   
    root.classList.remove(
      "theme-yellow",
      "theme-green",
      "theme-purple",
      "theme-teal",
      "theme-gray"
    );
  

    if (theme === "yellow") {
      root.classList.add("theme-yellow");
    } else if (theme === "green") {
      root.classList.add("theme-green");
    } else if (theme === "purple") {
      root.classList.add("theme-purple");
    } else if (theme === "teal") {
      root.classList.add("theme-teal");
    } else if (theme === "gray") {
      root.classList.add("theme-gray");
    }
  
    localStorage.setItem("theme", theme);
  }, [theme]);
  

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
