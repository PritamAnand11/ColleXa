import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export function AuthProvider({ children }) {

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const saved = localStorage.getItem("user");

    if (saved)
      setUser(JSON.parse(saved));

    setLoading(false);

  }, []);

  const login = (data) => {

    localStorage.setItem(
      "user",
      JSON.stringify(data)
    );

    setUser(data);
  };

  const logout = () => {

    localStorage.removeItem("user");

    setUser(null);
  };

  return (

    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        loading
      }}
    >

      {children}

    </AuthContext.Provider>

  );

}