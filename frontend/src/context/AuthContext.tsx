"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { User } from "@/types";

interface AuthContextType {
  user: User;
  users: User[];
  isHost: boolean;
  isLoggedIn: boolean;
  login: () => void;
  logout: () => void;
  switchUser: (user: User) => void;
  toggleHostMode: () => void;
}

const DEFAULT_GUEST: User = {
  id: 1,
  name: "Alex Rivera",
  email: "alex.rivera@example.com",
  avatar_url: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80",
  is_host: false,
  is_superhost: false,
  joined_date: "Joined May 2022",
};

const DEFAULT_HOST: User = {
  id: 2,
  name: "Elena Rostova",
  email: "elena.rostova@example.com",
  avatar_url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80",
  is_host: true,
  is_superhost: true,
  joined_date: "Superhost · 5 years hosting",
};

const AuthContext = createContext<AuthContextType>({
  user: DEFAULT_GUEST,
  users: [DEFAULT_GUEST, DEFAULT_HOST],
  isHost: false,
  isLoggedIn: false,
  login: () => {},
  logout: () => {},
  switchUser: () => {},
  toggleHostMode: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(DEFAULT_GUEST);
  const [users, setUsers] = useState<User[]>([DEFAULT_GUEST, DEFAULT_HOST]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Attempt to load users from backend or localStorage
    const saved = localStorage.getItem("airbnb_active_user");
    if (saved) {
      try {
        setUser(JSON.parse(saved));
        setIsLoggedIn(true);
      } catch {}
    }
  }, []);

  
  const login = () => {
    setIsLoggedIn(true);
    localStorage.setItem("airbnb_active_user", JSON.stringify(user));
  };

  const logout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem("airbnb_active_user");
    switchUser(DEFAULT_GUEST);
  };

  const switchUser = (selectedUser: User) => {
    setUser(selectedUser);
    localStorage.setItem("airbnb_active_user", JSON.stringify(selectedUser));
  };

  const toggleHostMode = () => {
    if (user.is_host) {
      switchUser(DEFAULT_GUEST);
    } else {
      switchUser(DEFAULT_HOST);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        users,
        isHost: user.is_host,
        isLoggedIn,
        login,
        logout,
        switchUser,
        toggleHostMode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
