import React from "react";
import styled from "styled-components";
import { useForm } from "react-hook-form";
import { Card, Button, Input, Select, Switch, Alert } from "@/components/ui";
import { THEME_CONFIG } from "@/config/constants/theme";
import { useService } from "../hooks/useService";
import { LaunchpadConfig as ILaunchpadConfig } from "../types/services";

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: ${THEME_CONFIG.spacing.xl};
`;

const Section = styled(Card)`
  margin-bottom: ${THEME_CONFIG.spacing.lg};
  padding: ${THEME_CONFIG.spacing.lg};
`;

const SectionTitle = styled.h3`
  margin: 0 0 ${THEME_CONFIG.spacing.md};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const FormGroup = styled.div`
  margin-bottom: ${THEME_CONFIG.spacing.md};
`;

const Label = styled.label`
  display: block;
  margin-bottom: ${THEME_CONFIG.spacing.xs};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

export const LaunchpadConfig: React.FC = () => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ILaunchpadConfig>();
  const { configureService, error, isProcessing } = useService();

  const onSubmit = async (data: ILaunchpadConfig) => {
    try {
      await configureService("LAUNCHPAD", data);
    } catch (err) {
      console.error("Erreur lors de la configuration du launchpad:", err);
    }
  };

  return (
    <Container>
      <h2>Configuration du Launchpad</h2>

      {error && (
        <Alert type="error" style={{ marginBottom: THEME_CONFIG.spacing.md }}>
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <Section>
          <SectionTitle>Configuration de la Presale</SectionTitle>
          <FormGroup>
            <Label>Nom du Token</Label>
            <Input
              {...register("tokenName", {
                required: "Le nom du token est requis",
              })}
              error={errors.tokenName?.message}
            />
          </FormGroup>
          <FormGroup>
            <Label>Symbole</Label>
            <Input
              {...register("tokenSymbol", {
                required: "Le symbole est requis",
              })}
              error={errors.tokenSymbol?.message}
            />
          </FormGroup>
          <FormGroup>
            <Label>Supply Total</Label>
            <Input
              type="number"
              {...register("totalSupply", {
                required: "Le supply total est requis",
              })}
              error={errors.totalSupply?.message}
            />
          </FormGroup>
        </Section>

        <Section>
          <SectionTitle>Configuration du Vesting</SectionTitle>
          <FormGroup>
            <Label>Période de Cliff (jours)</Label>
            <Input
              type="number"
              {...register("vestingCliff", { min: 0 })}
              error={errors.vestingCliff?.message}
            />
          </FormGroup>
          <FormGroup>
            <Label>Durée du Vesting (jours)</Label>
            <Input
              type="number"
              {...register("vestingDuration", { min: 0 })}
              error={errors.vestingDuration?.message}
            />
          </FormGroup>
        </Section>

        <Section>
          <SectionTitle>Configuration de la Whitelist</SectionTitle>
          <FormGroup>
            <Switch
              {...register("enableWhitelist")}
              label="Activer la whitelist"
            />
          </FormGroup>
          {watch("enableWhitelist") && (
            <FormGroup>
              <Label>Limite par Wallet (ETH)</Label>
              <Input
                type="number"
                {...register("whitelistLimit")}
                error={errors.whitelistLimit?.message}
              />
            </FormGroup>
          )}
        </Section>

        <Section>
          <SectionTitle>Audit de Sécurité</SectionTitle>
          <FormGroup>
            <Label>Niveau d'Audit</Label>
            <Select
              {...register("auditLevel")}
              options={[
                { value: "basic", label: "Basic" },
                { value: "standard", label: "Standard" },
                { value: "premium", label: "Premium" },
              ]}
            />
          </FormGroup>
        </Section>

        <Button
          type="submit"
          variant="primary"
          fullWidth
          disabled={isProcessing}
        >
          {isProcessing
            ? "Configuration en cours..."
            : "Configurer le Launchpad"}
        </Button>
      </form>
    </Container>
  );
};
