import React, { useState, useCallback } from 'react';
import { Box, Container, Typography, Paper, Snackbar, Alert } from '@mui/material';
import { AdminHeader } from './AdminHeader';
import { AdminTabs } from './AdminTabs';
import { ContractControls } from './contract';
import { OwnershipManagement } from './ownership';
import { AlertsManagement } from './alerts';
import { AuditLogs } from './audit';
import { AdminErrorBoundary } from './AdminErrorBoundary';

/**
 * Tableau de bord d'administration principal
 * Centralise l'accès à toutes les fonctionnalités d'administration
 */
export const AdminDashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState(0);
    const [error, setError] = useState<string | null>(null);

    const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
        setActiveTab(newValue);
    };

    const handleError = useCallback((message: string) => {
        setError(message);
    }, []);

    const handleCloseError = () => {
        setError(null);
    };

    // Contenu à afficher en fonction de l'onglet actif
    const renderTabContent = () => {
        switch (activeTab) {
            case 0: // Tableau de bord
                return (
                    <Box sx={{ mt: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Vue d'ensemble
                        </Typography>
                        <Paper sx={{ p: 3, mb: 3 }}>
                            <Typography variant="body1">
                                Bienvenue dans le tableau de bord d'administration de TokenForge.
                                Utilisez les onglets ci-dessus pour accéder aux différentes fonctionnalités d'administration.
                            </Typography>
                        </Paper>
                    </Box>
                );
            case 1: // Contrôle des contrats
                return <ContractControls onError={handleError} />;
            case 2: // Gestion des propriétaires
                return <OwnershipManagement onError={handleError} />;
            case 3: // Gestion des alertes
                return <AlertsManagement onError={handleError} />;
            case 4: // Journaux d'audit
                return <AuditLogs onError={handleError} />;
            default:
                return <Typography>Onglet non reconnu</Typography>;
        }
    };

    return (
        <AdminErrorBoundary>
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                <AdminHeader />

                <AdminTabs
                    value={activeTab}
                    onChange={handleTabChange}
                />

                <Box sx={{ mt: 3 }}>
                    {renderTabContent()}
                </Box>

                <Snackbar
                    open={!!error}
                    autoHideDuration={6000}
                    onClose={handleCloseError}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                >
                    <Alert onClose={handleCloseError} severity="error" sx={{ width: '100%' }}>
                        {error}
                    </Alert>
                </Snackbar>
            </Container>
        </AdminErrorBoundary>
    );
};

export default AdminDashboard;
