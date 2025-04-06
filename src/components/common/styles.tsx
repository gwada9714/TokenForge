import styled from "styled-components";
import { Link } from "react-router-dom";

export const Container = styled.div`
  padding: ${(props) => props.theme.spacing.md};
  margin: 0 auto;
  max-width: 1200px;
`;

export const Title = styled.h1`
  font-size: ${(props) => props.theme.spacing.xl};
  font-weight: bold;
  margin-bottom: ${(props) => props.theme.spacing.md};
  color: ${(props) => props.theme.colors.text.primary};
`;

export const Subtitle = styled.h2`
  font-size: ${(props) => props.theme.spacing.lg};
  font-weight: normal;
  margin-bottom: ${(props) => props.theme.spacing.sm};
  color: ${(props) => props.theme.colors.text.secondary};
`;

export const Text = styled.p`
  font-size: ${(props) => props.theme.spacing.md};
  line-height: 1.5;
  color: ${(props) => props.theme.colors.text.secondary};
`;

export const Button = styled.button`
  padding: ${(props) => `${props.theme.spacing.sm} ${props.theme.spacing.md}`};
  border-radius: ${(props) => props.theme.borderRadius};
  border: none;
  background-color: ${(props) => props.theme.colors.primary};
  color: ${(props) => props.theme.colors.background.primary};
  cursor: pointer;
  transition: ${(props) => props.theme.transition};

  &:hover {
    opacity: 0.9;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const LinkButton = styled(Link)`
  display: inline-block;
  padding: ${(props) => `${props.theme.spacing.sm} ${props.theme.spacing.md}`};
  border-radius: ${(props) => props.theme.borderRadius};
  background-color: ${(props) => props.theme.colors.primary};
  color: ${(props) => props.theme.colors.background.primary};
  text-decoration: none;
  transition: ${(props) => props.theme.transition};

  &:hover {
    opacity: 0.9;
  }
`;
