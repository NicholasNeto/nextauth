import Router from "next/router";
import { createContext, ReactNode, useState } from "react";
import { api } from "../service/api";

type SignInCredentials = {
    email: string;
    password: string;
}

type AuthContextData = {
    signIn(credentials: SignInCredentials): Promise<void>;
    isAuthenticated: boolean;
}

type AuthProviderProps = {
    children: ReactNode;
}


type User = {
    email: string;
    permissions: string;
    roles: string;
}

export const AuthContext = createContext({} as AuthContextData)

export function AuthProvider({ children }: AuthProviderProps) {

    const [user, setUser] = useState<User>();

    const isAuthenticated = false;

    async function signIn({ email, password }: SignInCredentials) {
        try {
            const response = await api.post('sessions', {
                email,
                password,
            })

            const { roles, permissions } = response.data
            setUser({
                roles,
                permissions,
                email
            })
            Router.push('/dashboard')
            console.log('---> ', response.data)

        } catch (error) {
            console.error(error)
        }
    }

    return (
        <AuthContext.Provider value={{ signIn, isAuthenticated }}>
            {children}
        </AuthContext.Provider>
    )
}

