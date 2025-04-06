import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Paper,
  Stepper,
  Step,
  StepLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Divider,
  Alert,
  Tooltip,
  IconButton,
  CircularProgress,
  InputAdornment,
  Slider,
  SelectChangeEvent,
} from "@mui/material";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import InfoIcon from "@mui/icons-material/Info";
import { useAuth } from "@/hooks/useAuth";
// import { TokenConfig } from '@/types/deployment';

interface VestingSchedule {
  enabled: boolean;
  cliff: number; // en jours
  duration: number; // en jours
  initialRelease: number; // pourcentage
  teamAllocation: number; // pourcentage
  marketingAllocation: number; // pourcentage
  liquidityAllocation: number; // pourcentage
}

interface LaunchpadConfig {
  name: string;
  symbol: string;
  description: string;
  tokenAddress: string;
  hardCap: string;
  softCap: string;
  presaleRate: string;
  listingRate: string;
  startTime: Date;
  endTime: Date;
  liquidityPercentage: number;
  lockupDuration: number; // en jours
  vestingSchedule: VestingSchedule;
}

const steps = [
  "Informations de base",
  "Configuration du token",
  "Vesting et distribution",
  "Vérification",
];

export const LaunchpadForm: React.FC = () => {
  const {
    /* user */
  } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [config, setConfig] = useState<LaunchpadConfig>({
    name: "",
    symbol: "",
    description: "",
    tokenAddress: "",
    hardCap: "",
    softCap: "",
    presaleRate: "",
    listingRate: "",
    startTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // demain
    endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // dans une semaine
    liquidityPercentage: 60,
    lockupDuration: 180,
    vestingSchedule: {
      enabled: false,
      cliff: 30,
      duration: 180,
      initialRelease: 20,
      teamAllocation: 15,
      marketingAllocation: 10,
      liquidityAllocation: 60,
    },
  });

  const [userTokens /* , setUserTokens */] = useState<
    { address: string; name: string; symbol: string }[]
  >([
    {
      address: "0x1234567890abcdef1234567890abcdef12345678",
      name: "Mon Token",
      symbol: "MTK",
    },
    {
      address: "0xabcdef1234567890abcdef1234567890abcdef12",
      name: "Community Token",
      symbol: "COMM",
    },
  ]);

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleChange =
    (field: keyof LaunchpadConfig) =>
    (event: React.ChangeEvent<HTMLInputElement | { value: unknown }>) => {
      const value = event.target.value;
      setConfig({ ...config, [field]: value });
    };

  const handleDateChange =
    (field: "startTime" | "endTime") => (newValue: Date | null) => {
      if (newValue) {
        setConfig({ ...config, [field]: newValue });
      }
    };

  const handleVestingChange =
    (field: keyof VestingSchedule) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value =
        event.target.type === "checkbox"
          ? event.target.checked
          : event.target.value;

      setConfig({
        ...config,
        vestingSchedule: {
          ...config.vestingSchedule,
          [field]: value,
        },
      });
    };

  const handleTokenSelect = (
    event: SelectChangeEvent<string> /* , child: ReactNode */
  ) => {
    const tokenAddress = event.target.value;
    const selectedToken = userTokens.find(
      (token) => token.address === tokenAddress
    );

    if (selectedToken) {
      setConfig({
        ...config,
        tokenAddress,
        name: selectedToken.name,
        symbol: selectedToken.symbol,
      });
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      // Simuler une soumission
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Rediriger vers la page de succès ou afficher un message
      setActiveStep(steps.length);
    } catch (error) {
      console.error("Erreur lors de la création du launchpad:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 0:
        return !!config.name && !!config.symbol && !!config.description;
      case 1:
        return (
          !!config.tokenAddress &&
          !!config.hardCap &&
          !!config.softCap &&
          !!config.presaleRate &&
          !!config.listingRate
        );
      case 2:
        return true; // Tous les champs ont des valeurs par défaut
      default:
        return true;
    }
  };

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Informations de base
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Sélectionnez votre token</InputLabel>
                <Select
                  value={config.tokenAddress}
                  onChange={handleTokenSelect}
                >
                  {userTokens.map((token) => (
                    <MenuItem key={token.address} value={token.address}>
                      {token.name} ({token.symbol}) -{" "}
                      {token.address.substring(0, 6)}...
                      {token.address.substring(38)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Nom du projet"
                value={config.name}
                onChange={handleChange("name")}
                helperText="Nom de votre projet de lancement"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Symbole"
                value={config.symbol}
                onChange={handleChange("symbol")}
                helperText="Symbole du token (3-4 caractères)"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                multiline
                rows={4}
                label="Description"
                value={config.description}
                onChange={handleChange("description")}
                helperText="Décrivez votre projet en quelques phrases"
              />
            </Grid>
          </Grid>
        );

      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Configuration du token
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                type="number"
                label="Hard Cap"
                value={config.hardCap}
                onChange={handleChange("hardCap")}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">BNB</InputAdornment>
                  ),
                }}
                helperText="Montant maximum à collecter"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                type="number"
                label="Soft Cap"
                value={config.softCap}
                onChange={handleChange("softCap")}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">BNB</InputAdornment>
                  ),
                }}
                helperText="Montant minimum pour considérer la presale comme réussie"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                type="number"
                label="Taux de Presale"
                value={config.presaleRate}
                onChange={handleChange("presaleRate")}
                helperText="Combien de tokens par BNB pendant la presale"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                type="number"
                label="Taux de Listing"
                value={config.listingRate}
                onChange={handleChange("listingRate")}
                helperText="Combien de tokens par BNB lors du listing"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <DateTimePicker
                label="Date de début"
                value={config.startTime}
                onChange={handleDateChange("startTime")}
                sx={{ width: "100%" }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <DateTimePicker
                label="Date de fin"
                value={config.endTime}
                onChange={handleDateChange("endTime")}
                sx={{ width: "100%" }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Typography gutterBottom>
                  Pourcentage de liquidité: {config.liquidityPercentage}%
                </Typography>
                <Tooltip title="Pourcentage des fonds collectés qui seront ajoutés à la liquidité lors du listing">
                  <IconButton size="small" sx={{ ml: 1 }}>
                    <InfoIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
              <Slider
                value={config.liquidityPercentage}
                onChange={(_, value) =>
                  setConfig({ ...config, liquidityPercentage: value as number })
                }
                min={30}
                max={100}
                step={5}
                valueLabelDisplay="auto"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Typography gutterBottom>
                  Durée de verrouillage de la liquidité: {config.lockupDuration}{" "}
                  jours
                </Typography>
                <Tooltip title="Durée pendant laquelle la liquidité sera verrouillée après le listing">
                  <IconButton size="small" sx={{ ml: 1 }}>
                    <InfoIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
              <Slider
                value={config.lockupDuration}
                onChange={(_, value) =>
                  setConfig({ ...config, lockupDuration: value as number })
                }
                min={30}
                max={365}
                step={30}
                marks={[
                  { value: 30, label: "30j" },
                  { value: 90, label: "90j" },
                  { value: 180, label: "180j" },
                  { value: 365, label: "365j" },
                ]}
                valueLabelDisplay="auto"
              />
            </Grid>
          </Grid>
        );

      case 3:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Vérification
              </Typography>
              <Alert severity="info" sx={{ mb: 3 }}>
                Veuillez vérifier attentivement les informations ci-dessous
                avant de soumettre votre projet.
              </Alert>
            </Grid>

            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Informations de base
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Nom du projet:
                    </Typography>
                    <Typography variant="body1">{config.name}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Symbole:
                    </Typography>
                    <Typography variant="body1">{config.symbol}</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
                      Adresse du token:
                    </Typography>
                    <Typography variant="body1">
                      {config.tokenAddress}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
                      Description:
                    </Typography>
                    <Typography variant="body1">
                      {config.description}
                    </Typography>
                  </Grid>
                </Grid>

                <Divider sx={{ my: 2 }} />

                <Typography variant="subtitle1" gutterBottom>
                  Configuration du token
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Hard Cap:
                    </Typography>
                    <Typography variant="body1">
                      {config.hardCap} BNB
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Soft Cap:
                    </Typography>
                    <Typography variant="body1">
                      {config.softCap} BNB
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Taux de Presale:
                    </Typography>
                    <Typography variant="body1">
                      {config.presaleRate} tokens/BNB
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Taux de Listing:
                    </Typography>
                    <Typography variant="body1">
                      {config.listingRate} tokens/BNB
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Date de début:
                    </Typography>
                    <Typography variant="body1">
                      {config.startTime.toLocaleString()}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Date de fin:
                    </Typography>
                    <Typography variant="body1">
                      {config.endTime.toLocaleString()}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Pourcentage de liquidité:
                    </Typography>
                    <Typography variant="body1">
                      {config.liquidityPercentage}%
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Durée de verrouillage:
                    </Typography>
                    <Typography variant="body1">
                      {config.lockupDuration} jours
                    </Typography>
                  </Grid>
                </Grid>

                <Divider sx={{ my: 2 }} />

                <Typography variant="subtitle1" gutterBottom>
                  Vesting et distribution
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
                      Vesting activé:
                    </Typography>
                    <Typography variant="body1">
                      {config.vestingSchedule.enabled ? "Oui" : "Non"}
                    </Typography>
                  </Grid>

                  {config.vestingSchedule.enabled && (
                    <>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Période de cliff:
                        </Typography>
                        <Typography variant="body1">
                          {config.vestingSchedule.cliff} jours
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Durée totale du vesting:
                        </Typography>
                        <Typography variant="body1">
                          {config.vestingSchedule.duration} jours
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Libération initiale:
                        </Typography>
                        <Typography variant="body1">
                          {config.vestingSchedule.initialRelease}%
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Allocation équipe:
                        </Typography>
                        <Typography variant="body1">
                          {config.vestingSchedule.teamAllocation}%
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Allocation marketing:
                        </Typography>
                        <Typography variant="body1">
                          {config.vestingSchedule.marketingAllocation}%
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Allocation liquidité:
                        </Typography>
                        <Typography variant="body1">
                          {config.vestingSchedule.liquidityAllocation}%
                        </Typography>
                      </Grid>
                    </>
                  )}
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        );

      case 2:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Vesting et distribution
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={config.vestingSchedule.enabled}
                      onChange={handleVestingChange("enabled")}
                    />
                  }
                  label="Activer le vesting"
                />
                <Tooltip title="Le vesting permet de libérer progressivement les tokens pour éviter les dumps massifs après le listing">
                  <IconButton size="small">
                    <InfoIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            </Grid>

            {config.vestingSchedule.enabled && (
              <>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Typography gutterBottom>
                      Période de cliff: {config.vestingSchedule.cliff} jours
                    </Typography>
                    <Tooltip title="Période pendant laquelle aucun token n'est libéré après la libération initiale">
                      <IconButton size="small" sx={{ ml: 1 }}>
                        <InfoIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                  <Slider
                    value={config.vestingSchedule.cliff}
                    onChange={(_, value) =>
                      setConfig({
                        ...config,
                        vestingSchedule: {
                          ...config.vestingSchedule,
                          cliff: value as number,
                        },
                      })
                    }
                    min={0}
                    max={90}
                    step={15}
                    marks={[
                      { value: 0, label: "0j" },
                      { value: 30, label: "30j" },
                      { value: 60, label: "60j" },
                      { value: 90, label: "90j" },
                    ]}
                    valueLabelDisplay="auto"
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Typography gutterBottom>
                      Durée totale du vesting: {config.vestingSchedule.duration}{" "}
                      jours
                    </Typography>
                    <Tooltip title="Durée totale pendant laquelle les tokens seront progressivement libérés">
                      <IconButton size="small" sx={{ ml: 1 }}>
                        <InfoIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                  <Slider
                    value={config.vestingSchedule.duration}
                    onChange={(_: Event, value: number | number[]) =>
                      setConfig({
                        ...config,
                        vestingSchedule: {
                          ...config.vestingSchedule,
                          duration: value as number,
                        },
                      })
                    }
                    min={30}
                    max={365}
                    step={30}
                    marks={[
                      { value: 30, label: "30j" },
                      { value: 90, label: "90j" },
                      { value: 180, label: "180j" },
                      { value: 365, label: "365j" },
                    ]}
                    valueLabelDisplay="auto"
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Typography gutterBottom>
                      Libération initiale:{" "}
                      {config.vestingSchedule.initialRelease}%
                    </Typography>
                    <Tooltip title="Pourcentage de tokens libérés immédiatement après le listing">
                      <IconButton size="small" sx={{ ml: 1 }}>
                        <InfoIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                  <Slider
                    value={config.vestingSchedule.initialRelease}
                    onChange={(_: Event, value: number | number[]) =>
                      setConfig({
                        ...config,
                        vestingSchedule: {
                          ...config.vestingSchedule,
                          initialRelease: value as number,
                        },
                      })
                    }
                    min={0}
                    max={50}
                    step={5}
                    valueLabelDisplay="auto"
                  />
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom>
                    Allocation des tokens
                  </Typography>
                  <Alert severity="info" sx={{ mb: 2 }}>
                    Définissez comment les tokens seront distribués. Le total
                    doit être égal à 100%.
                  </Alert>
                </Grid>

                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Allocation équipe (%)"
                    value={config.vestingSchedule.teamAllocation}
                    onChange={handleVestingChange("teamAllocation")}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">%</InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Allocation marketing (%)"
                    value={config.vestingSchedule.marketingAllocation}
                    onChange={handleVestingChange("marketingAllocation")}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">%</InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Allocation liquidité (%)"
                    value={config.vestingSchedule.liquidityAllocation}
                    onChange={handleVestingChange("liquidityAllocation")}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">%</InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  {config.vestingSchedule.teamAllocation +
                    config.vestingSchedule.marketingAllocation +
                    config.vestingSchedule.liquidityAllocation !==
                    100 && (
                    <Alert severity="warning">
                      Le total des allocations doit être égal à 100%.
                      Actuellement:{" "}
                      {config.vestingSchedule.teamAllocation +
                        config.vestingSchedule.marketingAllocation +
                        config.vestingSchedule.liquidityAllocation}
                      %
                    </Alert>
                  )}
                </Grid>
              </>
            )}
          </Grid>
        );

      default:
        return "Étape inconnue";
    }
  };

  return (
    <Box sx={{ width: "100%", mb: 4 }}>
      <Stepper activeStep={activeStep} alternativeLabel>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Paper sx={{ p: 4, mt: 4 }}>
        {activeStep === steps.length ? (
          <Box sx={{ textAlign: "center" }}>
            <Typography variant="h5" gutterBottom>
              Félicitations!
            </Typography>
            <Typography variant="subtitle1" sx={{ mb: 4 }}>
              Votre projet a été soumis avec succès. Il sera examiné par notre
              équipe et mis en ligne prochainement.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              href="/launchpad/dashboard"
            >
              Accéder au tableau de bord
            </Button>
          </Box>
        ) : (
          <>
            <Box sx={{ mt: 2, mb: 4 }}>{getStepContent(activeStep)}</Box>
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Button disabled={activeStep === 0} onClick={handleBack}>
                Retour
              </Button>
              <Box>
                {activeStep === steps.length - 1 ? (
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSubmit}
                    disabled={isSubmitting || !validateStep(activeStep)}
                    startIcon={
                      isSubmitting ? <CircularProgress size={20} /> : null
                    }
                  >
                    {isSubmitting ? "Soumission en cours..." : "Soumettre"}
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    onClick={handleNext}
                    disabled={!validateStep(activeStep)}
                  >
                    Suivant
                  </Button>
                )}
              </Box>
            </Box>
          </>
        )}
      </Paper>
    </Box>
  );
};
