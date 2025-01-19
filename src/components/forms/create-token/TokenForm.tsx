import React from "react";
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  Button,
  Typography,
  Paper,
  Container,
  TextField,
  FormControlLabel,
  Switch,
  Alert,
  CircularProgress,
  Tooltip,
  IconButton,
} from "@mui/material";
import { HelpOutline } from "@mui/icons-material";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const tokenSchema = z.object({
  name: z.string().min(1, "Token name is required").max(50),
  symbol: z.string().min(1, "Token symbol is required").max(10),
  decimals: z.number().min(0).max(18),
  totalSupply: z.string().min(1, "Total supply is required"),
  burnable: z.boolean(),
  mintable: z.boolean(),
  taxFee: z.number().min(0).max(25),
  liquidityFee: z.number().min(0).max(25),
});

type TokenFormData = z.infer<typeof tokenSchema>;

interface FieldProps {
  field: {
    value: any;
    onChange: (value: any) => void;
    name: string;
  };
}

const steps = ["Basic Info", "Advanced Settings", "Review"];

export const TokenForm = () => {
  const [activeStep, setActiveStep] = React.useState(0);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<TokenFormData>({
    resolver: zodResolver(tokenSchema),
    defaultValues: {
      decimals: 18,
      burnable: false,
      mintable: false,
      taxFee: 0,
      liquidityFee: 0,
    },
  });

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const onSubmit = async (data: TokenFormData) => {
    try {
      setIsSubmitting(true);
      setError(null);
      // TODO: Implement token creation logic
      console.log("Form data:", data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ mt: 4 }}>
            <Controller
              name="name"
              control={control}
              render={({ field }: FieldProps) => (
                <TextField
                  {...field}
                  label="Token Name"
                  fullWidth
                  error={!!errors.name}
                  helperText={errors.name?.message}
                  sx={{ mb: 3 }}
                />
              )}
            />
            <Controller
              name="symbol"
              control={control}
              render={({ field }: FieldProps) => (
                <TextField
                  {...field}
                  label="Token Symbol"
                  fullWidth
                  error={!!errors.symbol}
                  helperText={errors.symbol?.message}
                  sx={{ mb: 3 }}
                />
              )}
            />
            <Controller
              name="decimals"
              control={control}
              render={({ field }: FieldProps) => (
                <TextField
                  {...field}
                  type="number"
                  label="Decimals"
                  fullWidth
                  error={!!errors.decimals}
                  helperText={errors.decimals?.message}
                  sx={{ mb: 3 }}
                />
              )}
            />
            <Controller
              name="totalSupply"
              control={control}
              render={({ field }: FieldProps) => (
                <TextField
                  {...field}
                  label="Total Supply"
                  fullWidth
                  error={!!errors.totalSupply}
                  helperText={errors.totalSupply?.message}
                />
              )}
            />
          </Box>
        );
      case 1:
        return (
          <Box sx={{ mt: 4 }}>
            <Box sx={{ mb: 3, display: "flex", alignItems: "center" }}>
              <Controller
                name="burnable"
                control={control}
                render={({ field }: FieldProps) => (
                  <FormControlLabel
                    control={<Switch {...field} checked={field.value} />}
                    label="Burnable"
                  />
                )}
              />
              <Tooltip title="Allow token burning (permanent removal from circulation)">
                <IconButton size="small">
                  <HelpOutline />
                </IconButton>
              </Tooltip>
            </Box>

            <Box sx={{ mb: 3, display: "flex", alignItems: "center" }}>
              <Controller
                name="mintable"
                control={control}
                render={({ field }: FieldProps) => (
                  <FormControlLabel
                    control={<Switch {...field} checked={field.value} />}
                    label="Mintable"
                  />
                )}
              />
              <Tooltip title="Allow creation of new tokens after deployment">
                <IconButton size="small">
                  <HelpOutline />
                </IconButton>
              </Tooltip>
            </Box>

            <Controller
              name="taxFee"
              control={control}
              render={({ field }: FieldProps) => (
                <TextField
                  {...field}
                  type="number"
                  label="Tax Fee (%)"
                  fullWidth
                  error={!!errors.taxFee}
                  helperText={errors.taxFee?.message}
                  sx={{ mb: 3 }}
                />
              )}
            />

            <Controller
              name="liquidityFee"
              control={control}
              render={({ field }: FieldProps) => (
                <TextField
                  {...field}
                  type="number"
                  label="Liquidity Fee (%)"
                  fullWidth
                  error={!!errors.liquidityFee}
                  helperText={errors.liquidityFee?.message}
                />
              )}
            />
          </Box>
        );
      case 2:
        const formData = watch();
        return (
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom>
              Review Your Token
            </Typography>
            <Paper sx={{ p: 3, mt: 2 }}>
              <Typography variant="body1" paragraph>
                <strong>Name:</strong> {formData.name}
              </Typography>
              <Typography variant="body1" paragraph>
                <strong>Symbol:</strong> {formData.symbol}
              </Typography>
              <Typography variant="body1" paragraph>
                <strong>Decimals:</strong> {formData.decimals}
              </Typography>
              <Typography variant="body1" paragraph>
                <strong>Total Supply:</strong> {formData.totalSupply}
              </Typography>
              <Typography variant="body1" paragraph>
                <strong>Features:</strong>{" "}
                {[
                  formData.burnable && "Burnable",
                  formData.mintable && "Mintable",
                ]
                  .filter(Boolean)
                  .join(", ") || "None"}
              </Typography>
              <Typography variant="body1" paragraph>
                <strong>Tax Fee:</strong> {formData.taxFee}%
              </Typography>
              <Typography variant="body1">
                <strong>Liquidity Fee:</strong> {formData.liquidityFee}%
              </Typography>
            </Paper>
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <Container maxWidth="md">
      <Paper sx={{ p: 4, mt: 4 }}>
        <Typography variant="h4" align="center" gutterBottom>
          Create Your Token
        </Typography>

        <Stepper activeStep={activeStep} sx={{ mt: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <form onSubmit={handleSubmit(onSubmit)}>
          {renderStepContent(activeStep)}

          {error && (
            <Alert severity="error" sx={{ mt: 3 }}>
              {error}
            </Alert>
          )}

          <Box sx={{ display: "flex", justifyContent: "space-between", mt: 4 }}>
            <Button disabled={activeStep === 0} onClick={handleBack}>
              Back
            </Button>
            <Box>
              {activeStep === steps.length - 1 ? (
                <Button
                  variant="contained"
                  type="submit"
                  disabled={isSubmitting}
                  startIcon={isSubmitting && <CircularProgress size={20} />}
                >
                  {isSubmitting ? "Creating Token..." : "Create Token"}
                </Button>
              ) : (
                <Button variant="contained" onClick={handleNext}>
                  Next
                </Button>
              )}
            </Box>
          </Box>
        </form>
      </Paper>
    </Container>
  );
};
