import { createContext } from "react";

export type AuthContextValue = {
  token: string | null;
  isLoggedIn: boolean;
  login: (token: string) => void;
  logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | null>(null);
