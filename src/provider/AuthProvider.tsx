import { fetchProfile } from "@/hooks/api";
import axios from "axios";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

interface User {
    age: number;
    country_of_residence: string;
    date_of_birth: string;
    email: string;
    first_name: string;
    language: string;
    last_name: string;
    risk_region: string;
    sex: string;
}

const AuthContext = createContext<
    | {
          token: string | null;
          user: User | null;
          setToken: (newToken: string | null) => void;
      }
    | undefined
>(undefined);

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [token, setToken_] = useState(localStorage.getItem("token"));
    const [user, setUser] = useState<User | null>(null);

    const setToken = (newToken: string | null) => {
        setToken_(newToken);
    };

    useEffect(() => {
        const fetchUserProfile = async () => {
            if (token) {
                try {
                    axios.defaults.headers.common["Authorization"] = "Bearer " + token;
                    localStorage.setItem("token", token);

                    const response = await fetchProfile(token);
                    console.log("Fetched user profile:", response);

                    setUser(response.data);
                } catch (error) {
                    console.error("Failed to fetch user profile:", error);
                    setToken(null); // Clear token if validation fails
                    setUser(null);
                }
            } else {
                delete axios.defaults.headers.common["Authorization"];
                localStorage.removeItem("token");
                setUser(null);
            }
        };

        fetchUserProfile();
    }, [token]);

    const contextValue = useMemo(
        () => ({
            token,
            user,
            setToken,
        }),
        [token, user]
    );

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};

export default AuthProvider;
