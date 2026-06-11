import { createContext, useState, useEffect } from "react";

export const SearchContext = createContext();

export const SearchProvider = ({ children }) => {

  const [history, setHistory] = useState([]);

  useEffect(() => {

    const saved = localStorage.getItem("searchHistory");

    if (saved) setHistory(JSON.parse(saved));

  }, []);

  const saveSearchHistory = (term) => {

    if (!term) return;

    const newHistory = [term, ...history.filter(h => h !== term)];

    setHistory(newHistory);

    localStorage.setItem(
      "searchHistory",
      JSON.stringify(newHistory)
    );

  };

  return (
    <SearchContext.Provider
      value={{ history, saveSearchHistory }}
    >
      {children}
    </SearchContext.Provider>
  );
};