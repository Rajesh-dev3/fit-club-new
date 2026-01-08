import { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(
    localStorage.getItem("theme") || "dark"
  );

  useEffect(() => {
    // Map JS theme values to the CSS class names used in theme.css
    // CSS defines light styles under `.theme-light` and dark as :root defaults.
    document.documentElement.className = theme === "light" ? "theme-light" : "";
    localStorage.setItem("theme", theme);
    window.dispatchEvent(new Event("themeChange")); // AntD tokens refresh
  }, [theme]);

  const toggleTheme = () =>
    setTheme(theme === "light" ? "dark" : "light");

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
