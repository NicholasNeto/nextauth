import Router from "next/router";
import { setCookie, parseCookies, destroyCookie } from "nookies";
import { createContext, ReactNode, useEffect, useState } from "react";
import { api } from "../service/apiClient";

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
    signOut: () =>  Promise<void>
    user: User;
    isAuthenticated: boolean;
}

type AuthProviderProps = {
    children: ReactNode;
}

export function signOut() {
    destroyCookie(undefined, 'nextauth.token');
    destroyCookie(undefined, 'nextauth.refreshToken');
    Router.push('/');
}


export const AuthContext = createContext({} as AuthContextData)

export function AuthProvider({ children }: AuthProviderProps) {

    const [user, setUser] = useState<User>();
    const isAuthenticated = !!user;


    useEffect(() => {
        const { 'nextauth.token': token } = parseCookies()
        if (token) {
            api.get('/me')
                .then(response => {
                    const { email, permissions, roles } = response.data
                    setUser({ email, permissions, roles })
                })
                .catch(() => {
                    signOut();
                })
        }
    }, [])

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

            api.defaults.headers['Authorization'] = `Bearer ${token}`
            Router.push('/dashboard')
            console.log('---> ', response.data)

        } catch (error) {
            console.error(error)
        }
    }

    return (
        <AuthContext.Provider value={{ signIn, isAuthenticated, user }}>
            {children}
        </AuthContext.Provider>
    )
}


