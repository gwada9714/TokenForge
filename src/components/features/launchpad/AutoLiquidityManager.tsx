import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Grid,
  Divider,
  Switch,
  FormControlLabel,
  Alert,
  Tooltip,
  IconButton,
  Paper,
  LinearProgress,
  Chip
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import SettingsIcon from '@mui/icons-material/Settings';
import ScheduleIcon from '@mui/icons-material/Schedule';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import { useAccount } from 'wagmi';
import { useLiquidityManager } from '@/hooks/useLiquidityManager';
import { formatValue } from '@/utils/web3Adapters';

export const AutoLiquidityManager: React.FC = () => {
  const { address } = useAccount();
  const { 
    userTokens, 
    setupAutomaticLiquidity, 
    modifyLiquiditySettings, 
    userLiquiditySettings,
    isLoading,
    liquidityStatus
  } = useLiquidityManager();
  
  const [selectedToken, setSelectedToken] = useState<string>('');
  const [autoSettings, setAutoSettings] = useState({
    enabled: false,
    targetRatio: 50, // pourcentage
    rebalanceThreshold: 5, // pourcentage
    maxSlippage: 1, // pourcentage
    rebalanceInterval: 24, // heures
    exchangeFee: 0.3, // pourcentage
    autoCompound: false,
    liquidityPair: 'USDT', // token pair for liquidity
  });
  
  const [advancedMode, setAdvancedMode] = useState(false);
  
  // Charger les paramètres existants si disponibles
  useEffect(() => {
    if (selectedToken && userLiquiditySettings?.[selectedToken]) {
      const settings = userLiquiditySettings[selectedToken];
      setAutoSettings({
        enabled: settings.enabled,
        targetRatio: settings.targetRatio,
        rebalanceThreshold: settings.rebalanceThreshold,
        maxSlippage: settings.maxSlippage,
        rebalanceInterval: settings.rebalanceInterval,
        exchangeFee: settings.exchangeFee,
        autoCompound: settings.autoCompound,
        liquidityPair: settings.liquidityPair,
      });
    }
  }, [selectedToken, userLiquiditySettings]);
  
  const handleTokenChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setSelectedToken(event.target.value as string);
  };
  
  const handleSettingChange = (setting: keyof typeof autoSettings) => (
    event: React.ChangeEvent<HTMLInputElement> | Event,
    newValue?: number | boolean
  ) => {
    if (setting === 'enabled' || setting === 'autoCompound') {
      setAutoSettings({
        ...autoSettings,
        [setting]: Boolean(newValue),
      });
    } else if (
      event.target &&
      'value' in event.target &&
      (setting === 'liquidityPair')
    ) {
      setAutoSettings({
        ...autoSettings,
        [setting]: (event.target as HTMLInputElement).value,
      });
    } else if (typeof newValue === 'number') {
      setAutoSettings({
        ...autoSettings,
        [setting]: newValue,
      });
    }
  };
  
  const handleSaveSettings = async () => {
    if (!selectedToken) return;
    
    try {
      if (userLiquiditySettings?.[selectedToken]) {
        await modifyLiquiditySettings(selectedToken, autoSettings);
      } else {
        await setupAutomaticLiquidity(selectedToken, autoSettings);
      }
    } catch (error) {
      console.error('Error saving auto-liquidity settings:', error);
    }
  };
  
  // Obtenir le statut de la liquidité pour le token sélectionné
  const tokenLiquidityStatus = selectedToken ? liquidityStatus?.[selectedToken] : null;
  
  // Calculer la prochaine exécution prévue
  const getNextRebalanceTime = () => {
    if (!tokenLiquidityStatus?.lastRebalance) return 'Première exécution en attente';
    
    const lastRebalance = new Date(tokenLiquidityStatus.lastRebalance);
    const nextRebalance = new Date(lastRebalance.getTime() + autoSettings.rebalanceInterval * 60 * 60 * 1000);
    return nextRebalance.toLocaleString();
  };
  
  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h5">
            Gestionnaire Automatique de Liquidité
          </Typography>
          <FormControlLabel
            control={
              <Switch
                checked={advancedMode}
                onChange={() => setAdvancedMode(!advancedMode)}
                color="primary"
              />
            }
            label="Mode avancé"
          />
        </Box>
        
        {!address ? (
          <Alert severity="info">Connectez votre portefeuille pour gérer la liquidité automatique</Alert>
        ) : (
          <>
            <FormControl fullWidth sx={{ mb: 4 }}>
              <InputLabel>Sélectionnez un token</InputLabel>
              <Select
                value={selectedToken}
                onChange={handleTokenChange}
                label="Sélectionnez un token"
              >
                {userTokens?.map((token) => (
                  <MenuItem key={token.address} value={token.address}>
                    {token.symbol} - {token.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            {selectedToken && (
              <>
                <Box mb={3}>
                  <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
                    <Typography variant="h6" gutterBottom>
                      Statut de la liquidité
                    </Typography>
                    {isLoading ? (
                      <LinearProgress sx={{ my: 2 }} />
                    ) : tokenLiquidityStatus ? (
                      <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12} sm={6} md={4}>
                          <Typography variant="body2" color="text.secondary">
                            Ratio actuel:
                          </Typography>
                          <Typography variant="body1">
                            {tokenLiquidityStatus.currentRatio}%
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                          <Typography variant="body2" color="text.secondary">
                            Prochaine exécution:
                          </Typography>
                          <Typography variant="body1">
                            {getNextRebalanceTime()}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                          <Typography variant="body2" color="text.secondary">
                            Statut:
                          </Typography>
                          <Chip
                            size="small"
                            color={tokenLiquidityStatus.needsRebalance ? "warning" : "success"}
                            label={tokenLiquidityStatus.needsRebalance ? "Rééquilibrage nécessaire" : "Équilibré"}
                          />
                        </Grid>
                      </Grid>
                    ) : (
                      <Typography>
                        Aucune donnée disponible. Configurez d'abord la gestion automatique.
                      </Typography>
                    )}
                  </Paper>
                
                  <FormControlLabel
                    control={
                      <Switch
                        checked={autoSettings.enabled}
                        onChange={(_, checked) => 
                          setAutoSettings({...autoSettings, enabled: checked})
                        }
                        color="primary"
                      />
                    }
                    label="Activer la gestion automatique de liquidité"
                  />
                </Box>
                
                {autoSettings.enabled && (
                  <>
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                        <Box mb={3}>
                          <Typography variant="subtitle1" gutterBottom display="flex" alignItems="center">
                            Ratio cible de liquidité
                            <Tooltip title="Pourcentage de jetons alloués à la liquidité par rapport à la capitalisation totale">
                              <IconButton size="small">
                                <InfoIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Typography>
                          <Slider
                            value={autoSettings.targetRatio}
                            onChange={handleSettingChange('targetRatio')}
                            min={1}
                            max={90}
                            step={1}
                            valueLabelDisplay="auto"
                            valueLabelFormat={value => `${value}%`}
                          />
                          <Typography variant="body2" color="text.secondary">
                            {autoSettings.targetRatio}% de la capitalisation du token
                          </Typography>
                        </Box>
                      </Grid>
                      
                      <Grid item xs={12} md={6}>
                        <Box mb={3}>
                          <Typography variant="subtitle1" gutterBottom display="flex" alignItems="center">
                            Paire de liquidité
                            <Tooltip title="Token à utiliser comme paire pour la liquidité">
                              <IconButton size="small">
                                <InfoIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Typography>
                          <FormControl fullWidth>
                            <Select
                              value={autoSettings.liquidityPair}
                              onChange={(e) => 
                                setAutoSettings({
                                  ...autoSettings, 
                                  liquidityPair: e.target.value as string
                                })
                              }
                            >
                              <MenuItem value="USDT">USDT</MenuItem>
                              <MenuItem value="USDC">USDC</MenuItem>
                              <MenuItem value="DAI">DAI</MenuItem>
                              <MenuItem value="ETH">ETH</MenuItem>
                              <MenuItem value="BNB">BNB</MenuItem>
                            </Select>
                          </FormControl>
                        </Box>
                      </Grid>
                      
                      <Grid item xs={12} md={6}>
                        <Box mb={3}>
                          <Typography variant="subtitle1" gutterBottom display="flex" alignItems="center">
                            Seuil de rééquilibrage
                            <Tooltip title="Écart par rapport au ratio cible nécessitant un rééquilibrage">
                              <IconButton size="small">
                                <InfoIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Typography>
                          <Slider
                            value={autoSettings.rebalanceThreshold}
                            onChange={handleSettingChange('rebalanceThreshold')}
                            min={0.5}
                            max={10}
                            step={0.5}
                            valueLabelDisplay="auto"
                            valueLabelFormat={value => `${value}%`}
                          />
                          <Typography variant="body2" color="text.secondary">
                            Rééquilibrer si l'écart dépasse {autoSettings.rebalanceThreshold}%
                          </Typography>
                        </Box>
                      </Grid>
                      
                      <Grid item xs={12} md={6}>
                        <Box mb={3}>
                          <Typography variant="subtitle1" gutterBottom display="flex" alignItems="center">
                            Intervalle de rééquilibrage
                            <Tooltip title="Fréquence de vérification et rééquilibrage potentiel">
                              <IconButton size="small">
                                <InfoIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Typography>
                          <Slider
                            value={autoSettings.rebalanceInterval}
                            onChange={handleSettingChange('rebalanceInterval')}
                            min={1}
                            max={168}
                            step={1}
                            valueLabelDisplay="auto"
                            valueLabelFormat={value => `${value}h`}
                          />
                          <Typography variant="body2" color="text.secondary">
                            Vérifier tous les {autoSettings.rebalanceInterval} heures
                          </Typography>
                        </Box>
                      </Grid>
                      
                      {advancedMode && (
                        <>
                          <Grid item xs={12}>
                            <Divider>Paramètres avancés</Divider>
                          </Grid>
                          
                          <Grid item xs={12} md={6}>
                            <Box mb={3}>
                              <Typography variant="subtitle1" gutterBottom display="flex" alignItems="center">
                                Slippage maximum
                                <Tooltip title="Tolérance maximale de variation de prix lors des transactions">
                                  <IconButton size="small">
                                    <InfoIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </Typography>
                              <Slider
                                value={autoSettings.maxSlippage}
                                onChange={handleSettingChange('maxSlippage')}
                                min={0.1}
                                max={5}
                                step={0.1}
                                valueLabelDisplay="auto"
                                valueLabelFormat={value => `${value}%`}
                              />
                            </Box>
                          </Grid>
                          
                          <Grid item xs={12} md={6}>
                            <Box mb={3}>
                              <Typography variant="subtitle1" gutterBottom display="flex" alignItems="center">
                                Frais d'échange estimés
                                <Tooltip title="Frais prélevés par les exchanges lors des opérations (information)">
                                  <IconButton size="small">
                                    <InfoIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </Typography>
                              <TextField
                                type="number"
                                value={autoSettings.exchangeFee}
                                onChange={(e) => 
                                  setAutoSettings({
                                    ...autoSettings, 
                                    exchangeFee: parseFloat(e.target.value)
                                  })
                                }
                                InputProps={{
                                  endAdornment: '%',
                                  inputProps: { 
                                    min: 0.01, 
                                    max: 3, 
                                    step: 0.01 
                                  }
                                }}
                                fullWidth
                              />
                            </Box>
                          </Grid>
                          
                          <Grid item xs={12}>
                            <FormControlLabel
                              control={
                                <Switch
                                  checked={autoSettings.autoCompound}
                                  onChange={(_, checked) => 
                                    setAutoSettings({...autoSettings, autoCompound: checked})
                                  }
                                  color="primary"
                                />
                              }
                              label="Auto-compound des frais de liquidité"
                            />
                            <Typography variant="body2" color="text.secondary">
                              Réinvestir automatiquement les frais générés par la liquidité
                            </Typography>
                          </Grid>
                        </>
                      )}
                    </Grid>
                    
                    <Box display="flex" mt={4} mb={2}>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={handleSaveSettings}
                        disabled={isLoading}
                        startIcon={<AutorenewIcon />}
                      >
                        {isLoading ? 'Enregistrement en cours...' : 'Enregistrer les paramètres'}
                      </Button>
                    </Box>
                    
                    <Alert severity="info" icon={<ScheduleIcon />}>
                      <Typography variant="body2">
                        La gestion automatique de liquidité s'exécute en arrière-plan et nécessite que votre token 
                        ait une paire de liquidité existante. Les fonds pour le rééquilibrage proviennent du wallet de déploiement.
                      </Typography>
                    </Alert>
                  </>
                )}
              </>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default AutoLiquidityManager;
