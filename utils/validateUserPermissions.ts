

type ValidateUserPermissionsParams = {
    user: User
    permissions?: string[];
    roles?: string[]
}


type User = {
    permissions: string[];
    roles: string[];
}


export function validateUserPermissions({ user, permissions, roles }: ValidateUserPermissionsParams) {

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