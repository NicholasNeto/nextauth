import { useContext } from "react"
import { AuthContext } from "../contexts/AuthContext"


type UseCanParams = {
    permissions?: string[];
    roles?: string[]
}

export function useCan({ permissions, roles }: UseCanParams) {
    const { user, isAuthenticated } = useContext(AuthContext)

    if (!isAuthenticated) {
        return false;
    }

    if (permissions && permissions?.length > 0) {

        const hasAllPermissions = permissions?.every(permission => {
            return user.permissions.includes(permission);
        })

        if (!hasAllPermissions) {
            return false;
        }
    }

    if (roles && roles?.length > 0) {
        // Porque o some? a ideia é liberar a visualização para dois tipos de roles e não ele tem que ser admin e editor.
        const hasAllroles = roles?.some(role => {  
            return user.roles.includes(role);
        })

        if (!hasAllroles) {
            return false;
        }
    }

    return true

}