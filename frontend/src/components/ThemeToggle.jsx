import React, { useEffect, useState } from "react";

export default function ThemeToggle() {

  const [dark, setDark] = useState(false);


  // Detect saved or system theme on load
  useEffect(() => {

    const saved =
      localStorage.getItem("theme");

    if (saved) {

      setDark(saved === "dark");

    } else {

      const prefersDark =
        window.matchMedia(
          "(prefers-color-scheme: dark)"
        ).matches;

      setDark(prefersDark);

    }

  }, []);


  // Apply theme
  useEffect(() => {

    if (dark) {

      document.documentElement
        .setAttribute("data-theme", "dark");

      localStorage.setItem(
        "theme",
        "dark"
      );

    } else {

      document.documentElement
        .removeAttribute("data-theme");

      localStorage.setItem(
        "theme",
        "light"
      );

    }

  }, [dark]);


  return (

    <button
      className="theme-toggle"
      onClick={() => setDark(!dark)}
    >

      {dark ? "☀️ Light" : "🌙 Dark"}

    </button>

  );

}