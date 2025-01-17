import React from 'react';
import styled from 'styled-components';
import { Container, Grid } from '@mui/material';
import { motion } from 'framer-motion';
import SecurityIcon from '@mui/icons-material/Security';
import LockIcon from '@mui/icons-material/Lock';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import CodeIcon from '@mui/icons-material/Code';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import GroupsIcon from '@mui/icons-material/Groups';
import SecurityFeature from '../common/SecurityFeature';
import { ForgeHeading } from '../common/ForgeHeading';

const SecuritySection: React.FC = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const securityFeatures = [
    {
      icon: <VerifiedUserIcon sx={{ fontSize: 40 }} />,
      title: "Audits de Sécurité",
      description: "Audité par CertiK et Hacken pour garantir la sécurité maximale",
      link: "/audit-reports"
    },
    {
      icon: <LockIcon sx={{ fontSize: 40 }} />,
      title: "Verrouillage de Liquidité",
      description: "Liquidité verrouillée pendant 2 ans sur Unicrypt",
      link: "/liquidity-lock"
    },
    {
      icon: <SecurityIcon sx={{ fontSize: 40 }} />,
      title: "Multi-Signature",
      description: "Gouvernance sécurisée par un système multi-signature Gnosis Safe",
      link: "/multi-sig"
    },
    {
      icon: <CodeIcon sx={{ fontSize: 40 }} />,
      title: "Code Open Source",
      description: "Code entièrement vérifié et accessible sur GitHub",
      link: "https://github.com/tokenforge"
    },
    {
      icon: <MonitorHeartIcon sx={{ fontSize: 40 }} />,
      title: "Monitoring 24/7",
      description: "Surveillance continue des contrats et des transactions",
      link: "/monitoring"
    },
    {
      icon: <GroupsIcon sx={{ fontSize: 40 }} />,
      title: "Équipe KYC Vérifiée",
      description: "Identité de l'équipe vérifiée par Assure DeFi",
      link: "/team-verification"
    }
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-white to-gray-50 relative overflow-hidden">
      {/* Motif de sécurité en arrière-plan */}
      <div className="absolute inset-0 bg-[url('/security-pattern.svg')] opacity-5" />

      <Container maxWidth="lg">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="relative z-10"
        >
          {/* En-tête de section */}
          <motion.div variants={itemVariants} className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-heading font-bold text-primary mb-6">
              Sécurité & <span className="text-secondary">Transparence</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Notre priorité absolue est la sécurité de vos actifs. Découvrez les mesures mises en place pour protéger la plateforme.
            </p>
          </motion.div>

          {/* Grille des fonctionnalités de sécurité */}
          <Grid container spacing={4}>
            {securityFeatures.map((feature, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <motion.div
                  variants={itemVariants}
                  className="bg-white rounded-xl p-6 h-full shadow-lg hover:shadow-xl transition-shadow duration-300"
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 text-primary">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-heading font-bold text-primary mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {feature.description}
                    </p>
                    <motion.a
                      href={feature.link}
                      className="text-secondary hover:text-secondary-light font-medium inline-flex items-center transition-colors duration-300"
                      whileHover={{ x: 5 }}
                    >
                      En savoir plus
                      <svg
                        className="w-4 h-4 ml-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </motion.a>
                  </div>
                </motion.div>
              </Grid>
            ))}
          </Grid>

          {/* Bannière de certification */}
          <motion.div
            variants={itemVariants}
            className="mt-16 bg-primary rounded-2xl p-8 text-center text-white"
          >
            <div className="max-w-3xl mx-auto">
              <h3 className="text-2xl font-heading font-bold mb-4">
                Certifications & Partenaires
              </h3>
              <div className="flex flex-wrap justify-center items-center gap-8">
                {/* Logos des partenaires de sécurité */}
                <img src="/certik-logo.svg" alt="CertiK" className="h-12 opacity-90 hover:opacity-100 transition-opacity" />
                <img src="/hacken-logo.svg" alt="Hacken" className="h-12 opacity-90 hover:opacity-100 transition-opacity" />
                <img src="/assure-logo.svg" alt="Assure DeFi" className="h-12 opacity-90 hover:opacity-100 transition-opacity" />
              </div>
            </div>
          </motion.div>
        </motion.div>
      </Container>
    </section>
  );
};

export default SecuritySection;
