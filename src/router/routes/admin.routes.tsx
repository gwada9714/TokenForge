import { lazy } from 'react';
import { RouteObject } from 'react-router-dom';
import { AdminGuard } from '../../guards/AdminGuard';
import { Outlet } from 'react-router-dom';

// Chargement paresseux des composants d'administration
const AdminDashboard = lazy(() => import('../../components/features/admin/AdminDashboard'));
const ContractControls = lazy(() => import('../../components/features/admin/contract/ContractControls'));
const OwnershipManagement = lazy(() => import('../../components/features/admin/ownership/OwnershipManagement'));
const AlertsManagement = lazy(() => import('../../components/features/admin/alerts/AlertsManagement'));
const AuditLogs = lazy(() => import('../../components/features/admin/audit/AuditLogs'));

// Gestionnaire d'erreur commun pour tous les composants admin
const handleError = (msg: string) => console.error(msg);

/**
 * Routes d'administration
 * Toutes les routes sont protégées par AdminGuard
 */
export const adminRoutes: RouteObject = {
    path: '/admin',
    element: <AdminGuard><Outlet /></AdminGuard>,
    children: [
        {
            index: true,
            element: <AdminDashboard />
        },
        {
            path: 'contract',
            element: <ContractControls onError={handleError} />
        },
        {
            path: 'ownership',
            element: <OwnershipManagement onError={handleError} />
        },
        {
            path: 'alerts',
            element: <AlertsManagement onError={handleError} />
        },
        {
            path: 'audit',
            element: <AuditLogs onError={handleError} />
        }
    ]
};
