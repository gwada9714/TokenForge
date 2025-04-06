import React from "react";
import styled from "styled-components";
import { Button } from "@/components/ui/Button";

const FooterContainer = styled.footer`
  background-color: #182038;
  color: #ffffff;
  padding: 4rem 2rem 2rem;
`;

const Content = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const TopSection = styled.div`
  display: grid;
  grid-template-columns: 2fr repeat(3, 1fr);
  gap: 4rem;
  padding-bottom: 3rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 2rem;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 2rem;
  }

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const BrandSection = styled.div`
  .logo {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1.5rem;

    img {
      height: 32px;
    }

    span {
      font-family: "Montserrat", sans-serif;
      font-size: 1.5rem;
      font-weight: 700;
    }
  }

  .description {
    font-family: "Open Sans", sans-serif;
    font-size: 1rem;
    color: #f5f5f5;
    opacity: 0.8;
    margin-bottom: 1.5rem;
    line-height: 1.6;
  }
`;

const FooterColumn = styled.div`
  h3 {
    font-family: "Montserrat", sans-serif;
    font-size: 1.125rem;
    font-weight: 600;
    margin-bottom: 1.5rem;
    color: #d97706;
  }

  ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  li {
    margin-bottom: 0.75rem;
  }

  a {
    font-family: "Open Sans", sans-serif;
    color: #f5f5f5;
    text-decoration: none;
    opacity: 0.8;
    transition: opacity 0.2s ease-in-out;

    &:hover {
      opacity: 1;
    }
  }
`;

const BottomSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 2rem;

  @media (max-width: 640px) {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
`;

const Copyright = styled.div`
  font-family: "Open Sans", sans-serif;
  font-size: 0.875rem;
  color: #f5f5f5;
  opacity: 0.8;
`;

const SocialLinks = styled.div`
  display: flex;
  gap: 1rem;

  a {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.1);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background-color 0.2s ease-in-out;

    &:hover {
      background-color: #d97706;
    }

    svg {
      width: 20px;
      height: 20px;
      color: #ffffff;
    }
  }
`;

const NewsletterForm = styled.form`
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;

  input {
    flex: 1;
    padding: 0.75rem 1rem;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 0.5rem;
    background: rgba(255, 255, 255, 0.05);
    color: #ffffff;
    font-family: "Open Sans", sans-serif;

    &::placeholder {
      color: rgba(255, 255, 255, 0.5);
    }

    &:focus {
      outline: none;
      border-color: #d97706;
    }
  }
`;

const Footer: React.FC = () => {
  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Gérer l'inscription à la newsletter
  };

  return (
    <FooterContainer>
      <Content>
        <TopSection>
          <BrandSection>
            <div className="logo">
              <img src="/logo.svg" alt="TokenForge" />
              <span>TokenForge</span>
            </div>
            <p className="description">
              Créez, déployez et gérez vos tokens en toute simplicité. Une
              plateforme puissante pour donner vie à vos projets crypto.
            </p>
            <NewsletterForm onSubmit={handleNewsletterSubmit}>
              <input type="email" placeholder="Votre email" required />
              <Button variant="primary" size="medium" type="submit">
                S'inscrire
              </Button>
            </NewsletterForm>
          </BrandSection>

          <FooterColumn>
            <h3>Produit</h3>
            <ul>
              <li>
                <a href="#features">Fonctionnalités</a>
              </li>
              <li>
                <a href="#pricing">Tarifs</a>
              </li>
              <li>
                <a href="#token">Token $TKN</a>
              </li>
              <li>
                <a href="#roadmap">Roadmap</a>
              </li>
            </ul>
          </FooterColumn>

          <FooterColumn>
            <h3>Ressources</h3>
            <ul>
              <li>
                <a href="/docs">Documentation</a>
              </li>
              <li>
                <a href="/tutorials">Tutoriels</a>
              </li>
              <li>
                <a href="/blog">Blog</a>
              </li>
              <li>
                <a href="/faq">FAQ</a>
              </li>
            </ul>
          </FooterColumn>

          <FooterColumn>
            <h3>Entreprise</h3>
            <ul>
              <li>
                <a href="/about">À propos</a>
              </li>
              <li>
                <a href="/careers">Carrières</a>
              </li>
              <li>
                <a href="/contact">Contact</a>
              </li>
              <li>
                <a href="/press">Presse</a>
              </li>
            </ul>
          </FooterColumn>
        </TopSection>

        <BottomSection>
          <Copyright>
            &copy; {new Date().getFullYear()} TokenForge. Tous droits réservés.
          </Copyright>

          <SocialLinks>
            <a
              href="https://twitter.com/tokenforge"
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
              </svg>
            </a>
            <a
              href="https://discord.gg/tokenforge"
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
              </svg>
            </a>
            <a
              href="https://github.com/tokenforge"
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22" />
              </svg>
            </a>
          </SocialLinks>
        </BottomSection>
      </Content>
    </FooterContainer>
  );
};

export default Footer;
