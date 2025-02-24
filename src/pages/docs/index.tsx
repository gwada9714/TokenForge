import React from 'react';
import styled from 'styled-components';
import { Container, Title, Text } from '@/components/common/styles';
import { SPACING } from '@/config/constants/theme';

const DocsContainer = styled(Container)`
  max-width: 1000px;
`;

const SectionTitle = styled(Title)`
  font-size: 1.75rem;
  margin-top: ${SPACING.xl};
`;

const DocsSidebar = styled.aside`
  width: 250px;
  position: sticky;
  top: 80px;
  height: calc(100vh - 80px);
  overflow-y: auto;
  padding: ${SPACING.lg};
  border-right: 1px solid ${props => props.theme.colors.border};
`;

const DocsContent = styled.div`
  flex: 1;
  padding: ${SPACING.lg};
`;

const DocsLayout = styled.div`
  display: flex;
  gap: ${SPACING.xl};
`;

export default function Documentation() {
  return (
    <DocsContainer>
      <Title>Centre de Documentation</Title>
      <Text>Bienvenue dans la documentation de TokenForge. Trouvez ici toutes les ressources nécessaires pour utiliser notre plateforme.</Text>
      
      <DocsLayout>
        <DocsSidebar>
          <nav>
            <h3>Guides</h3>
            <ul>
              <li>Démarrage Rapide</li>
              <li>Création de Token</li>
              <li>Sécurité</li>
            </ul>
            
            <h3>API</h3>
            <ul>
              <li>Introduction</li>
              <li>Authentication</li>
              <li>Endpoints</li>
            </ul>
            
            <h3>Sécurité</h3>
            <ul>
              <li>Bonnes Pratiques</li>
              <li>Audit</li>
              <li>Alertes</li>
            </ul>
          </nav>
        </DocsSidebar>

        <DocsContent>
          <SectionTitle>Démarrage Rapide</SectionTitle>
          <Text>
            Apprenez à utiliser TokenForge en quelques minutes. Ce guide vous accompagnera
            dans vos premiers pas sur la plateforme.
          </Text>

          <SectionTitle>Guides Interactifs</SectionTitle>
          <Text>
            Nos guides interactifs vous permettent d'apprendre en pratiquant.
            Suivez les étapes et créez votre premier token en toute confiance.
          </Text>

          <SectionTitle>Centre de Sécurité</SectionTitle>
          <Text>
            La sécurité est notre priorité. Découvrez nos recommandations et
            bonnes pratiques pour protéger vos tokens et vos investissements.
          </Text>
        </DocsContent>
      </DocsLayout>
    </DocsContainer>
  );
} 