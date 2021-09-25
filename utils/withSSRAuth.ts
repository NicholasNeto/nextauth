import decode from 'jwt-decode'
import { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from "next"
import { destroyCookie, parseCookies } from "nookies"
import { AuthTokenErros } from "../service/errors/AuthTokenErros"
import { validateUserPermissions } from './validateUserPermissions'


type WithSSRAuthOptions = {
    permissions?: string[];
    roles?: string[];
}

export function withSSRAuth<P>(fn: GetServerSideProps<P>, options?: WithSSRAuthOptions) {
    return async (context: GetServerSidePropsContext): Promise<GetServerSidePropsResult<P>> => {
        const cookies = parseCookies(context)

        const token = cookies['nextauth.token']

        console.log('teste')

        if (!token) {
            return {
                redirect: {
                    destination: '/',
                    permanent: false,
                }
            }
        }

        if (options) {
            const user = decode<{ permissions: string[], roles: string[] }>(token)
            const { permissions, roles } = options

            const userHasValidPermissions = validateUserPermissions({ user, permissions, roles })


            if (!userHasValidPermissions) {

                {/*
                     // não deveria ser login pq pode ser que ele só não 
                     tenha permissão de ver a metrics, então 
                     leve ele para uma page que todos podem ver 
                */}

                return {
                    redirect: {
                        destination: '/dashboard',
                        permanent: false,
                    }
                }
            }

            console.log("user", user)
        }

        try {
            return await fn(context)
        } catch (error) {
            if (error instanceof AuthTokenErros) {

                destroyCookie(context, 'nextauth.token')
                destroyCookie(context, 'nextauth.refresToken')

                return {
                    redirect: {
                        destination: '/',
                        permanent: false,
                    }
                }
            }

        }

    }
}