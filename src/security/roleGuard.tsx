// AdolatAI - Foydalanuvchi roli tekshiruvi (Role Guard)

import { User } from '../types';
import logger from '../core/logger';

type Permission =
    | 'document:analyze'
    | 'document:view'
    | 'document:delete'
    | 'kazus:solve'
    | 'kazus:view'
    | 'template:create'
    | 'template:view'
    | 'history:view'
    | 'history:clear'
    | 'settings:view'
    | 'settings:edit'
    | 'admin:access';

type Role = 'user' | 'lawyer' | 'admin';

// Rol-ruxsatlar xaritasi
const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
    user: [
        'document:analyze',
        'document:view',
        'kazus:view',
        'template:view',
        'history:view',
        'settings:view'
    ],
    lawyer: [
        'document:analyze',
        'document:view',
        'document:delete',
        'kazus:solve',
        'kazus:view',
        'template:create',
        'template:view',
        'history:view',
        'history:clear',
        'settings:view',
        'settings:edit'
    ],
    admin: [
        'document:analyze',
        'document:view',
        'document:delete',
        'kazus:solve',
        'kazus:view',
        'template:create',
        'template:view',
        'history:view',
        'history:clear',
        'settings:view',
        'settings:edit',
        'admin:access'
    ]
};

/**
 * Foydalanuvchining ma'lum ruxsatga ega ekanligini tekshirish
 */
export const hasPermission = (user: User | null, permission: Permission): boolean => {
    if (!user) {
        logger.warn('Permission check failed: no user', { permission });
        return false;
    }

    const role = user.role as Role;
    const permissions = ROLE_PERMISSIONS[role] || [];

    const allowed = permissions.includes(permission);

    if (!allowed) {
        logger.warn('Permission denied', {
            userId: user.id,
            role,
            permission
        });
    }

    return allowed;
};

/**
 * Foydalanuvchining bir necha ruxsatlardan biriga ega ekanligini tekshirish
 */
export const hasAnyPermission = (
    user: User | null,
    permissions: Permission[]
): boolean => {
    return permissions.some(p => hasPermission(user, p));
};

/**
 * Foydalanuvchining barcha ruxsatlarga ega ekanligini tekshirish
 */
export const hasAllPermissions = (
    user: User | null,
    permissions: Permission[]
): boolean => {
    return permissions.every(p => hasPermission(user, p));
};

/**
 * Foydalanuvchi roli tekshiruvi
 */
export const hasRole = (user: User | null, role: Role): boolean => {
    if (!user) return false;
    return user.role === role;
};

/**
 * Admin ekanligini tekshirish
 */
export const isAdmin = (user: User | null): boolean => {
    return hasRole(user, 'admin');
};

/**
 * Advokat ekanligini tekshirish
 */
export const isLawyer = (user: User | null): boolean => {
    return hasRole(user, 'lawyer') || hasRole(user, 'admin');
};

/**
 * React komponenti uchun guard HOC
 */
export const withPermission = (
    permission: Permission,
    fallback: React.ReactNode = null
) => {
    return function PermissionGuard({
        children,
        user
    }: {
        children: React.ReactNode;
        user: User | null;
    }) {
        if (hasPermission(user, permission)) {
            return <>{children}</>;
        }
        return <>{fallback}</>;
    };
};

export default {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    isAdmin,
    isLawyer,
    withPermission
};
