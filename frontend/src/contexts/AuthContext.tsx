import { createContext, useState, ReactNode } from "react";
import { jwtDecode, JwtPayload } from "jwt-decode";
import { useNavigate } from "react-router-dom";

interface User {
  id: number;
  role: "client" | "freelancer";
}

interface CustomJwtPayload extends JwtPayload {
  sub: string;
  role: "client" | "freelancer";
}

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  setUser: () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();

  const getInitialUser = (): User | null => {
    const token = localStorage.getItem("access_token");
    if (token) {
      try {
        const decoded = jwtDecode<CustomJwtPayload>(token);
        console.log("Token decodificado inicial:", decoded); 
        if (decoded.exp && decoded.exp * 1000 > Date.now()) {
          return {
            id: parseInt(decoded.sub, 10),
            role: decoded.role,
          };
        }
      } catch (err) {
        console.error("Erro ao decodificar token inicial:", err);
      }
      localStorage.removeItem("access_token");
    }
    return null;
  };

  const [user, setUser] = useState<User | null>(getInitialUser());

  const logout = () => {
    localStorage.removeItem("access_token");
    setUser(null);
    navigate("/sign");
  };

  return (
    <AuthContext.Provider value={{ user, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
