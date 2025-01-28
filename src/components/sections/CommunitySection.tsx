import React from 'react';
import styled from 'styled-components';
import { Card } from '@/components/ui/Card';
import { StyledButton } from '@/components/ui/Button';

const SectionContainer = styled.section`
  padding: 6rem 2rem;
  background: linear-gradient(135deg, #182038 0%, #2A3352 100%);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url('/community-pattern.svg') repeat;
    opacity: 0.05;
    z-index: 1;
  }
`;

const Content = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
  z-index: 2;
`;

const SectionHeader = styled.div`
  text-align: center;
  margin-bottom: 4rem;
  color: #FFFFFF;
`;

const Title = styled.h2`
  font-family: 'Montserrat', sans-serif;
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 1rem;

  span {
    background: linear-gradient(135deg, #D97706, #FFD700);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
`;

const Description = styled.p`
  font-family: 'Open Sans', sans-serif;
  font-size: 1.125rem;
  color: #F5F5F5;
  opacity: 0.9;
  max-width: 600px;
  margin: 0 auto;
`;

const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 2rem;
  margin-bottom: 4rem;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const StatCard = styled(Card)`
  text-align: center;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const StatValue = styled.div`
  font-family: 'Montserrat', sans-serif;
  font-size: 2rem;
  font-weight: 700;
  color: #D97706;
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
  font-family: 'Open Sans', sans-serif;
  font-size: 1rem;
  color: #FFFFFF;
`;

const ChannelsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const ChannelCard = styled(Card)`
  background: #FFFFFF;
  transition: transform 0.3s ease-in-out;

  &:hover {
    transform: translateY(-8px);
  }
`;

const ChannelIcon = styled.div`
  width: 64px;
  height: 64px;
  margin: 0 auto 1.5rem;
  background: linear-gradient(135deg, #182038, #2A3352);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    width: 32px;
    height: 32px;
    color: #D97706;
  }
`;

const ChannelTitle = styled.h3`
  font-family: 'Montserrat', sans-serif;
  font-size: 1.25rem;
  font-weight: 600;
  color: #182038;
  margin-bottom: 0.75rem;
  text-align: center;
`;

const ChannelDescription = styled.p`
  font-family: 'Open Sans', sans-serif;
  font-size: 1rem;
  color: #4B5563;
  text-align: center;
  margin-bottom: 1.5rem;
  line-height: 1.6;
`;

const ChannelStats = styled.div`
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
`;

const ChannelStat = styled.div`
  text-align: center;
`;

const ChannelStatValue = styled.div`
  font-family: 'Montserrat', sans-serif;
  font-size: 1.25rem;
  font-weight: 600;
  color: #D97706;
`;

const ChannelStatLabel = styled.div`
  font-family: 'Open Sans', sans-serif;
  font-size: 0.875rem;
  color: #4B5563;
`;

const communityStats = [
  { value: "50K+", label: "Membres" },
  { value: "25K", label: "Holders" },
  { value: "100+", label: "Pays" },
  { value: "24/7", label: "Support" }
];

const channels = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 20l9-5.25L12 4 3 14.75 12 20z" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M3 14.75L12 20l9-5.25-9-5.25L3 14.75z" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: "Discord",
    description: "Rejoignez notre communauté Discord pour discuter avec d'autres forgerons et obtenir de l'aide en temps réel.",
    stats: [
      { value: "35K", label: "Membres" },
      { value: "150+", label: "Channels" }
    ],
    buttonText: "Rejoindre Discord",
    buttonLink: "https://discord.gg/tokenforge"
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: "Twitter",
    description: "Suivez-nous sur Twitter pour les dernières actualités, mises à jour et annonces importantes.",
    stats: [
      { value: "25K", label: "Followers" },
      { value: "5K+", label: "Mentions" }
    ],
    buttonText: "Suivre sur Twitter",
    buttonLink: "https://twitter.com/tokenforge"
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: "Telegram",
    description: "Restez connecté avec notre groupe Telegram pour des discussions et des alertes en temps réel.",
    stats: [
      { value: "20K", label: "Membres" },
      { value: "24/7", label: "Actif" }
    ],
    buttonText: "Rejoindre Telegram",
    buttonLink: "https://t.me/tokenforge"
  }
];

export const CommunitySection: React.FC = () => {
  return (
    <SectionContainer id="community">
      <Content>
        <SectionHeader>
          <Title>
            Rejoignez la <span>Communauté</span>
          </Title>
          <Description>
            Une communauté vibrante de passionnés de crypto, d'innovateurs et de builders.
          </Description>
        </SectionHeader>

        <StatsContainer>
          {communityStats.map((stat, index) => (
            <StatCard key={index} $padding="large">
              <StatValue>{stat.value}</StatValue>
              <StatLabel>{stat.label}</StatLabel>
            </StatCard>
          ))}
        </StatsContainer>

        <ChannelsGrid>
          {channels.map((channel, index) => (
            <ChannelCard key={index} $padding="large">
              <ChannelIcon>
                {channel.icon}
              </ChannelIcon>
              <ChannelTitle>{channel.title}</ChannelTitle>
              <ChannelDescription>{channel.description}</ChannelDescription>
              <ChannelStats>
                {channel.stats.map((stat, statIndex) => (
                  <ChannelStat key={statIndex}>
                    <ChannelStatValue>{stat.value}</ChannelStatValue>
                    <ChannelStatLabel>{stat.label}</ChannelStatLabel>
                  </ChannelStat>
                ))}
              </ChannelStats>
              <StyledButton
                $variant="primary"
                $size="large"
                $fullWidth
                onClick={() => window.open(channel.buttonLink, '_blank')}
              >
                {channel.buttonText}
              </StyledButton>
            </ChannelCard>
          ))}
        </ChannelsGrid>
      </Content>
    </SectionContainer>
  );
};
