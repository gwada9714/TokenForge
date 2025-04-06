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
  FormHelperText,
  Divider,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  CardActions,
} from "@mui/material";
import { useAuth } from "@/hooks/useAuth";

interface KYCFormData {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  nationality: string;
  documentType: "passport" | "id_card" | "driving_license";
  documentNumber: string;
  documentExpiry: string;
  residenceAddress: string;
  city: string;
  postalCode: string;
  country: string;
}

const steps = [
  "Informations personnelles",
  "Document d'identité",
  "Adresse de résidence",
  "Vérification",
];

export const KYCVerificationForm: React.FC = () => {
  const {
    /* user */
  } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [documentFrontFile, setDocumentFrontFile] = useState<File | null>(null);
  const [documentBackFile, setDocumentBackFile] = useState<File | null>(null);
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [proofOfAddressFile, setProofOfAddressFile] = useState<File | null>(
    null
  );
  const [verificationStatus, setVerificationStatus] = useState<
    "pending" | "approved" | "rejected" | null
  >(null);

  const [formData, setFormData] = useState<KYCFormData>({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    nationality: "",
    documentType: "passport",
    documentNumber: "",
    documentExpiry: "",
    residenceAddress: "",
    city: "",
    postalCode: "",
    country: "",
  });

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleChange =
    (field: keyof KYCFormData) =>
    (event: React.ChangeEvent<HTMLInputElement | { value: unknown }>) => {
      const value = event.target.value;
      setFormData({ ...formData, [field]: value });
    };

  const handleFileChange =
    (fileType: "front" | "back" | "selfie" | "address") =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      if (event.target.files && event.target.files[0]) {
        const file = event.target.files[0];

        switch (fileType) {
          case "front":
            setDocumentFrontFile(file);
            break;
          case "back":
            setDocumentBackFile(file);
            break;
          case "selfie":
            setSelfieFile(file);
            break;
          case "address":
            setProofOfAddressFile(file);
            break;
        }
      }
    };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      // Simuler un upload de fichiers avec progression
      for (let i = 0; i <= 100; i += 10) {
        setUploadProgress(i);
        await new Promise((resolve) => setTimeout(resolve, 200));
      }

      // Simuler une soumission à un service KYC
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Simuler une réponse
      setVerificationStatus("pending");
      setActiveStep(steps.length);
    } catch (error) {
      console.error("Erreur lors de la vérification KYC:", error);
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 0:
        return (
          !!formData.firstName &&
          !!formData.lastName &&
          !!formData.dateOfBirth &&
          !!formData.nationality
        );
      case 1:
        return (
          !!formData.documentType &&
          !!formData.documentNumber &&
          !!formData.documentExpiry &&
          !!documentFrontFile &&
          (formData.documentType !== "passport" ? !!documentBackFile : true) &&
          !!selfieFile
        );
      case 2:
        return (
          !!formData.residenceAddress &&
          !!formData.city &&
          !!formData.postalCode &&
          !!formData.country &&
          !!proofOfAddressFile
        );
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
                Informations personnelles
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Veuillez fournir vos informations personnelles telles qu'elles
                apparaissent sur vos documents officiels.
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Prénom"
                value={formData.firstName}
                onChange={handleChange("firstName")}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Nom"
                value={formData.lastName}
                onChange={handleChange("lastName")}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Date de naissance"
                type="date"
                value={formData.dateOfBirth}
                onChange={handleChange("dateOfBirth")}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Nationalité</InputLabel>
                <Select
                  value={formData.nationality}
                  onChange={handleChange("nationality") as any}
                  label="Nationalité"
                >
                  <MenuItem value="FR">France</MenuItem>
                  <MenuItem value="BE">Belgique</MenuItem>
                  <MenuItem value="CH">Suisse</MenuItem>
                  <MenuItem value="CA">Canada</MenuItem>
                  <MenuItem value="LU">Luxembourg</MenuItem>
                  <MenuItem value="MC">Monaco</MenuItem>
                  {/* Ajouter d'autres pays selon les besoins */}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        );

      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Document d'identité
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Veuillez fournir un document d'identité valide. Assurez-vous que
                le document est clairement visible et que toutes les
                informations sont lisibles.
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Type de document</InputLabel>
                <Select
                  value={formData.documentType}
                  onChange={handleChange("documentType") as any}
                  label="Type de document"
                >
                  <MenuItem value="passport">Passeport</MenuItem>
                  <MenuItem value="id_card">Carte d'identité</MenuItem>
                  <MenuItem value="driving_license">
                    Permis de conduire
                  </MenuItem>
                </Select>
                <FormHelperText>
                  Sélectionnez le type de document que vous souhaitez utiliser
                  pour la vérification
                </FormHelperText>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Numéro de document"
                value={formData.documentNumber}
                onChange={handleChange("documentNumber")}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Date d'expiration"
                type="date"
                value={formData.documentExpiry}
                onChange={handleChange("documentExpiry")}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle1" gutterBottom>
                Téléchargement des documents
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Button
                variant="outlined"
                component="label"
                fullWidth
                sx={{ height: 56, textTransform: "none" }}
              >
                {documentFrontFile
                  ? documentFrontFile.name
                  : "Recto du document"}
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleFileChange("front")}
                />
              </Button>
              <FormHelperText>
                Téléchargez une photo claire du recto de votre document
              </FormHelperText>
            </Grid>

            {formData.documentType !== "passport" && (
              <Grid item xs={12} sm={6}>
                <Button
                  variant="outlined"
                  component="label"
                  fullWidth
                  sx={{ height: 56, textTransform: "none" }}
                >
                  {documentBackFile
                    ? documentBackFile.name
                    : "Verso du document"}
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleFileChange("back")}
                  />
                </Button>
                <FormHelperText>
                  Téléchargez une photo claire du verso de votre document
                </FormHelperText>
              </Grid>
            )}

            <Grid item xs={12} sm={6}>
              <Button
                variant="outlined"
                component="label"
                fullWidth
                sx={{ height: 56, textTransform: "none" }}
              >
                {selfieFile ? selfieFile.name : "Selfie avec document"}
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleFileChange("selfie")}
                />
              </Button>
              <FormHelperText>
                Téléchargez un selfie de vous tenant votre document d'identité
              </FormHelperText>
            </Grid>
          </Grid>
        );

      case 2:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Adresse de résidence
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Veuillez fournir votre adresse de résidence actuelle et un
                justificatif de domicile récent (moins de 3 mois).
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Adresse"
                value={formData.residenceAddress}
                onChange={handleChange("residenceAddress")}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Ville"
                value={formData.city}
                onChange={handleChange("city")}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Code postal"
                value={formData.postalCode}
                onChange={handleChange("postalCode")}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Pays</InputLabel>
                <Select
                  value={formData.country}
                  onChange={handleChange("country") as any}
                  label="Pays"
                >
                  <MenuItem value="FR">France</MenuItem>
                  <MenuItem value="BE">Belgique</MenuItem>
                  <MenuItem value="CH">Suisse</MenuItem>
                  <MenuItem value="CA">Canada</MenuItem>
                  <MenuItem value="LU">Luxembourg</MenuItem>
                  <MenuItem value="MC">Monaco</MenuItem>
                  {/* Ajouter d'autres pays selon les besoins */}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle1" gutterBottom>
                Justificatif de domicile
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Button
                variant="outlined"
                component="label"
                fullWidth
                sx={{ height: 56, textTransform: "none" }}
              >
                {proofOfAddressFile
                  ? proofOfAddressFile.name
                  : "Justificatif de domicile"}
                <input
                  type="file"
                  hidden
                  accept="image/*,application/pdf"
                  onChange={handleFileChange("address")}
                />
              </Button>
              <FormHelperText>
                Téléchargez un justificatif de domicile récent (facture
                d'électricité, eau, gaz, téléphone, etc.)
              </FormHelperText>
            </Grid>
          </Grid>
        );

      case 3:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Vérification des informations
              </Typography>
              <Alert severity="info" sx={{ mb: 3 }}>
                Veuillez vérifier attentivement les informations ci-dessous
                avant de soumettre votre demande de vérification KYC.
              </Alert>
            </Grid>

            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Informations personnelles
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Nom complet:
                    </Typography>
                    <Typography variant="body1">
                      {formData.firstName} {formData.lastName}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Date de naissance:
                    </Typography>
                    <Typography variant="body1">
                      {formData.dateOfBirth}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Nationalité:
                    </Typography>
                    <Typography variant="body1">
                      {formData.nationality}
                    </Typography>
                  </Grid>
                </Grid>

                <Divider sx={{ my: 2 }} />

                <Typography variant="subtitle1" gutterBottom>
                  Document d'identité
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Type de document:
                    </Typography>
                    <Typography variant="body1">
                      {formData.documentType === "passport"
                        ? "Passeport"
                        : formData.documentType === "id_card"
                        ? "Carte d'identité"
                        : "Permis de conduire"}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Numéro de document:
                    </Typography>
                    <Typography variant="body1">
                      {formData.documentNumber}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Date d'expiration:
                    </Typography>
                    <Typography variant="body1">
                      {formData.documentExpiry}
                    </Typography>
                  </Grid>
                </Grid>

                <Divider sx={{ my: 2 }} />

                <Typography variant="subtitle1" gutterBottom>
                  Adresse de résidence
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
                      Adresse:
                    </Typography>
                    <Typography variant="body1">
                      {formData.residenceAddress}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Ville:
                    </Typography>
                    <Typography variant="body1">{formData.city}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Code postal:
                    </Typography>
                    <Typography variant="body1">
                      {formData.postalCode}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Pays:
                    </Typography>
                    <Typography variant="body1">{formData.country}</Typography>
                  </Grid>
                </Grid>

                <Divider sx={{ my: 2 }} />

                <Typography variant="subtitle1" gutterBottom>
                  Documents téléchargés
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Recto du document:
                    </Typography>
                    <Typography variant="body1">
                      {documentFrontFile?.name || "Non téléchargé"}
                    </Typography>
                  </Grid>
                  {formData.documentType !== "passport" && (
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Verso du document:
                      </Typography>
                      <Typography variant="body1">
                        {documentBackFile?.name || "Non téléchargé"}
                      </Typography>
                    </Grid>
                  )}
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Selfie avec document:
                    </Typography>
                    <Typography variant="body1">
                      {selfieFile?.name || "Non téléchargé"}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Justificatif de domicile:
                    </Typography>
                    <Typography variant="body1">
                      {proofOfAddressFile?.name || "Non téléchargé"}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
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
              Demande soumise avec succès
            </Typography>

            <Box sx={{ my: 4 }}>
              <Card sx={{ maxWidth: 400, mx: "auto" }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Statut de vérification
                  </Typography>

                  <Alert
                    severity={
                      verificationStatus === "approved"
                        ? "success"
                        : verificationStatus === "rejected"
                        ? "error"
                        : "info"
                    }
                    sx={{ mb: 2 }}
                  >
                    {verificationStatus === "approved"
                      ? "Vérifié"
                      : verificationStatus === "rejected"
                      ? "Rejeté"
                      : "En attente de vérification"}
                  </Alert>

                  <Typography variant="body2" color="text.secondary" paragraph>
                    {verificationStatus === "approved"
                      ? "Votre vérification KYC a été approuvée. Vous pouvez maintenant accéder à toutes les fonctionnalités de la plateforme."
                      : verificationStatus === "rejected"
                      ? "Votre vérification KYC a été rejetée. Veuillez vérifier les informations fournies et réessayer."
                      : "Votre demande de vérification KYC est en cours de traitement. Ce processus peut prendre jusqu'à 24-48 heures ouvrables."}
                  </Typography>

                  <Typography variant="body2">
                    ID de référence:{" "}
                    <strong>
                      KYC-
                      {Math.random()
                        .toString(36)
                        .substring(2, 10)
                        .toUpperCase()}
                    </strong>
                  </Typography>
                </CardContent>

                <CardActions sx={{ justifyContent: "center" }}>
                  <Button variant="contained" color="primary" href="/dashboard">
                    Retour au tableau de bord
                  </Button>
                </CardActions>
              </Card>
            </Box>
          </Box>
        ) : (
          <>
            <Box sx={{ mt: 2, mb: 4 }}>{getStepContent(activeStep)}</Box>

            {isSubmitting && uploadProgress > 0 && (
              <Box sx={{ width: "100%", mb: 3 }}>
                <Typography variant="body2" gutterBottom>
                  Téléchargement des documents: {uploadProgress}%
                </Typography>
                <LinearProgress value={uploadProgress} />
              </Box>
            )}

            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Button
                disabled={activeStep === 0 || isSubmitting}
                onClick={handleBack}
              >
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

// Composant manquant pour la progression linéaire
const LinearProgress: React.FC<{ /* variant: string; */ value: number }> = ({
  /* variant, */ value,
}) => {
  return (
    <Box sx={{ width: "100%", bgcolor: "#e0e0e0", borderRadius: 1, height: 8 }}>
      <Box
        sx={{
          width: `${value}%`,
          bgcolor: "primary.main",
          borderRadius: 1,
          height: 8,
          transition: "width 0.3s ease-in-out",
        }}
      />
    </Box>
  );
};
