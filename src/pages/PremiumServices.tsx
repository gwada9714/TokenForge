import React from "react";
import { Box, Container } from "@mui/material";
import { PremiumDashboard } from "@/components/premium/PremiumDashboard";
import { useTokenForgePremium } from "@/hooks/useTokenForgePremium";
import { PlanType } from "@/types/premium";
import { RequirePlan } from "@/components/auth/RequirePlan";

const PremiumServices: React.FC = () => {
  const { userPlan } = useTokenForgePremium();

  return (
    <RequirePlan requiredPlan={PlanType.MaitreForgeron}>
      <Container maxWidth="lg">
        <Box sx={{ py: 4 }}>
          <PremiumDashboard />
        </Box>
      </Container>
    </RequirePlan>
  );
};

export default PremiumServices;
