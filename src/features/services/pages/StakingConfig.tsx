import React from "react";
import styled from "styled-components";
import { useForm } from "react-hook-form";
import { Card, Button, Input, Alert } from "@/components/ui";
import { THEME_CONFIG } from "@/config/constants/theme";
import { useService } from "../hooks/useService";
import { StakingConfig as IStakingConfig } from "../types/services";

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

const TokenList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: ${THEME_CONFIG.spacing.md};
  margin-top: ${THEME_CONFIG.spacing.md};
`;

export const StakingConfig: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<IStakingConfig>();
  const { configureService, error, isProcessing } = useService();
  const [rewardTokens, setRewardTokens] = React.useState<string[]>([]);

  const onSubmit = async (data: IStakingConfig) => {
    try {
      await configureService("STAKING", {
        ...data,
        rewardTokens,
      });
    } catch (err) {
      console.error("Erreur lors de la configuration du staking:", err);
    }
  };

  const addRewardToken = () => {
    setRewardTokens([...rewardTokens, ""]);
  };

  const updateRewardToken = (index: number, value: string) => {
    const newTokens = [...rewardTokens];
    newTokens[index] = value;
    setRewardTokens(newTokens);
  };

  return (
    <Container>
      <h2>Configuration du Staking</h2>

      {error && (
        <div style={{ marginBottom: THEME_CONFIG.spacing.md }}>
          <Alert type="error">{error}</Alert>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <Section>
          <SectionTitle>Configuration du Staking Flexible</SectionTitle>
          <FormGroup>
            <Label>APR (%)</Label>
            <Input
              type="number"
              {...register("flexibleApr", {
                required: "L'APR est requis",
                min: { value: 0, message: "L'APR doit être positif" },
              })}
              error={errors.flexibleApr?.message}
            />
          </FormGroup>
          <FormGroup>
            <Label>Période minimale (jours)</Label>
            <Input
              type="number"
              {...register("flexibleMinPeriod", { min: 0 })}
              error={errors.flexibleMinPeriod?.message}
            />
          </FormGroup>
        </Section>

        <Section>
          <SectionTitle>Configuration du Staking Verrouillé</SectionTitle>
          <FormGroup>
            <Label>APR de Base (%)</Label>
            <Input
              type="number"
              {...register("lockedBaseApr", {
                required: "L'APR de base est requis",
                min: { value: 0, message: "L'APR doit être positif" },
              })}
              error={errors.lockedBaseApr?.message}
            />
          </FormGroup>
          <FormGroup>
            <Label>Bonus Maximum (%)</Label>
            <Input
              type="number"
              {...register("lockedMaxBonus", { min: 0 })}
              error={errors.lockedMaxBonus?.message}
            />
          </FormGroup>
          <FormGroup>
            <Label>Période maximale (jours)</Label>
            <Input
              type="number"
              {...register("lockedMaxPeriod", { min: 0 })}
              error={errors.lockedMaxPeriod?.message}
            />
          </FormGroup>
        </Section>

        <Section>
          <SectionTitle>Configuration des Récompenses</SectionTitle>
          <FormGroup>
            <Label>Fréquence de Distribution (heures)</Label>
            <Input
              type="number"
              {...register("rewardFrequency", { min: 1 })}
              error={errors.rewardFrequency?.message}
            />
          </FormGroup>

          <Button
            type="button"
            variant="secondary"
            onClick={addRewardToken}
            style={{ marginBottom: THEME_CONFIG.spacing.md }}
          >
            Ajouter un Token de Récompense
          </Button>

          <TokenList>
            {rewardTokens.map((token, index) => (
              <FormGroup key={index}>
                <Label>Adresse du Token {index + 1}</Label>
                <Input
                  value={token}
                  onChange={(e) => updateRewardToken(index, e.target.value)}
                  placeholder="0x..."
                />
              </FormGroup>
            ))}
          </TokenList>
        </Section>

        <Button
          type="submit"
          variant="primary"
          fullWidth
          disabled={isProcessing}
        >
          {isProcessing ? "Configuration en cours..." : "Configurer le Staking"}
        </Button>
      </form>
    </Container>
  );
};
