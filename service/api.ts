import axios, { AxiosError } from 'axios';
import { parseCookies, setCookie } from 'nookies'


{/*
    Aqui é uma funcionalidade para interceptar uma chamada, então imagina que 
    vocẽ quer redirecionar todos os erros 403 para login você poderia criar um 
    interceptador destes no axios, existe interceptador de request (indo para servidor)
    e resposta ao voltar do servidor ex:  interceptors.response || interceptors.request
*/}


let cookies = parseCookies()


export const api = axios.create({
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
            cookies = parseCookies()
            const { 'nextauth.refreshToken': refreshToken } = cookies

            api.post('/refresh', {
                refreshToken,
            }).then(response => {
                const { token } = response.data
                setCookie(undefined, 'nextauth.token', token, {
                    maxAge: 60 * 60 * 24 * 30, // 30 days
                    path: '/'
                })

                setCookie(undefined, 'nextauth.refreshToken', response.data.refreshToken, {
                    maxAge: 60 * 60 * 24 * 30, // 30 days
                    path: '/'
                })

                api.defaults.headers['Authorization'] = `Bearer ${token}`
            });
        } else {
            // desligar o usuario  
        }
    }
})

