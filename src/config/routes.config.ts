export const ROUTES = {
    DEFAULT: '/',
    LOGIN: '/login',
    REGISTER: '/register',
    DASHBOARD: '/dashboard',
    PROFILE: '/profile',
    NOT_FOUND: '*'
} as const;

export const PROTECTED_ROUTES = [
    ROUTES.DASHBOARD,
    ROUTES.PROFILE
];

export const PUBLIC_ROUTES = [
    ROUTES.LOGIN,
    ROUTES.REGISTER
];
