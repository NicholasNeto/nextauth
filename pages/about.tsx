import { useContext, useEffect } from "react"
import { Can } from "../components/Can"
import { AuthContext } from "../contexts/AuthContext"
import { useCan } from "../hooks/useCan"
import { setupAPIClient } from "../service/api"
import { api } from "../service/apiClient"
import { withSSRAuth } from "../utils/withSSRAuth"

export default function About() {

    const { user } = useContext(AuthContext)

    useEffect(() => {
        api.get('/me')
            .then(response => console.log(response))
            .catch(error => console.error(error))
    }, [])

    return (
        <>
            <h1>About {user?.email}</h1>

            <Can permissions={['metrics.list']} >
                <div>Metrics</div>
            </Can>
        </>

    )
}

export const getServerSideProps = withSSRAuth(async (ctx) => {
    const apiClient = setupAPIClient(ctx)
    const response = await apiClient.get('/me')

    console.log(response)

    return {
        props: {}
    }
})