import { useContext, useEffect } from "react"
import { AuthContext } from "../contexts/AuthContext"
import { useCan } from "../hooks/useCan"
import { setupAPIClient } from "../service/api"
import { api } from "../service/apiClient"
import { withSSRAuth } from "../utils/withSSRAuth"

export default function Dashboard() {

    const { user } = useContext(AuthContext)

    const userCanSeeMetrics = useCan({
        permissions: ['metrics.list']
        // roles : poderia ser roles:  [administrador, editor]  os dois podem
    })

    useEffect(() => {
        api.get('/me')
            .then(response => console.log(response))
            .catch(error => console.error(error))
    }, [])

    return (
        <>
            <h1>Dashboard {user?.email}</h1>
            {userCanSeeMetrics && <div>
                Metrics
            </div>}
        </>

    )
}

export const getServerSideProps = withSSRAuth(async (ctx) => {
    const apiClient = setupAPIClient(ctx)
    const response = await apiClient.get('/me')

    // console.log(response)

    return {
        props: {}
    }
})