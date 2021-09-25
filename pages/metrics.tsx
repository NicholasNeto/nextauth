import { useContext, useEffect } from "react"
import { AuthContext } from "../contexts/AuthContext"
import { useCan } from "../hooks/useCan"
import { setupAPIClient } from "../service/api"
import { api } from "../service/apiClient"
import { withSSRAuth } from "../utils/withSSRAuth"


export default function Metrics() {

    return (
        <>
            <h1>Metrics </h1>
        </>

    )
}

export const getServerSideProps = withSSRAuth(async (ctx) => {
    const apiClient = setupAPIClient(ctx)
    await apiClient.get('/me')

    return {
        props: {}
    }
}, {
    permissions: ['metrics.teste'],
    roles: ['administrator']
})