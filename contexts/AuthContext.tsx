import Router from "next/router";
import { setCookie } from "nookies";
import { createContext, ReactNode, useState } from "react";
import { api } from "../service/api";

type SignInCredentials = {
    email: string;
    password: string;
}

type User = {
    email: string;
    permissions: string[];
    roles: string[];
}

type AuthContextData = {
    signIn(credentials: SignInCredentials): Promise<void>;
    user: User;
    isAuthenticated: boolean;
}

type AuthProviderProps = {
    children: ReactNode;
}



export const AuthContext = createContext({} as AuthContextData)

export function AuthProvider({ children }: AuthProviderProps) {

    const [user, setUser] = useState<User>();

    const isAuthenticated = !!user;

    async function signIn({ email, password }: SignInCredentials) {
        try {
            const response = await api.post('sessions', {
                email,
                password,
            })

            const { token, refreshToken, roles, permissions } = response.data
            
            setCookie(undefined, 'nextauth.token', token, {
                maxAge: 60 * 60 * 24 * 30, // 30 days
                path: '/'
            })


            setCookie(undefined, 'nextauth.refreshToken', refreshToken, {
                maxAge: 60 * 60 * 24 * 30, // 30 days
                path: '/'
            })

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
        <AuthContext.Provider value={{ signIn, isAuthenticated, user}}>
            {children}
        </AuthContext.Provider>
    )
}

