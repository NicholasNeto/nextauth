import axios, { AxiosError } from 'axios';
import { parseCookies, setCookie } from 'nookies'
import { signOut } from '../contexts/AuthContext';

{/*
    Aqui é uma funcionalidade para interceptar uma chamada, então imagina que 
    vocẽ quer redirecionar todos os erros 403 para login você poderia criar um 
    interceptador destes no axios, existe interceptador de request (indo para servidor)
    e resposta ao voltar do servidor ex:  interceptors.response || interceptors.request

    Atenção
    Dentro dos interceptors do axios não é aceito async e await
*/}

let isRefreshing = false;
let failedRequestQueue: any = []


export function setupAPIClient(ctx = undefined) {
    let cookies = parseCookies(ctx)

    const api = axios.create({
        baseURL: 'http://localhost:3333',
        headers: {
            Authorization: `Bearer ${cookies['nextauth.token']}`
        }
    })

    api.interceptors.response.use(response => {
        return response;
    }, (error: AxiosError) => {
        // error.response?.status // StatusCode ex: 401 | 403 etc ... 
        if (error.response?.status === 401) {
            if (error.response?.data.code === 'token.expired') {
                // renovar o token 
                cookies = parseCookies(ctx)
                const { 'nextauth.refreshToken': refreshToken } = cookies

                const originalConfig = error.config

                if (!isRefreshing) {
                    isRefreshing = true

                    api.post('/refresh', {
                        refreshToken,
                    }).then(response => {
                        const { token } = response.data
                        setCookie(ctx, 'nextauth.token', token, {
                            maxAge: 60 * 60 * 24 * 30, // 30 days
                            path: '/'
                        })

                        setCookie(ctx, 'nextauth.refreshToken', response.data.refreshToken, {
                            maxAge: 60 * 60 * 24 * 30, // 30 days
                            path: '/'
                        })

                        api.defaults.headers['Authorization'] = `Bearer ${token}`;

                        failedRequestQueue.forEach(request => request.onSuccess(token))
                        failedRequestQueue = []
                    }).catch(err => {
                        failedRequestQueue.forEach(request => request.onFailure(err))
                        failedRequestQueue = []

                        if (process.browser) {
                            signOut()
                        }

                    }).finally(() => {
                        isRefreshing = false
                    });
                }

                return new Promise((resolve, reject) => {
                    failedRequestQueue.push({
                        onSuccess: (token: string) => {
                            originalConfig.headers['Authorization'] = `Bearer ${token}`
                            resolve(api(originalConfig))
                        },
                        onFailure: (error: AxiosError) => {
                            reject(error)
                        }
                    })
                })

            } else {
                // desligar o usuario 
                if (process.browser) {
                    signOut()
                }
                // if (error.response?.status === 401) {}
            }
        }
        return Promise.reject(error)
    })

    return api;
}