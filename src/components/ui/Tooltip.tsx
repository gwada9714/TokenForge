import React, { useState } from "react";
import styled from "styled-components";
import { SPACING } from "@/config/constants/theme";

interface TooltipProps {
  content: string;
  position?: "top" | "bottom" | "left" | "right";
  children: React.ReactNode;
}

const TooltipWrapper = styled.div`
  position: relative;
  display: inline-block;
`;

const TooltipContent = styled.div<{
  isVisible: boolean;
  position: "top" | "bottom" | "left" | "right";
}>`
  position: absolute;
  background-color: ${(props) => props.theme.colors.text.primary};
  color: ${(props) => props.theme.colors.background.primary};
  padding: ${SPACING.xs} ${SPACING.sm};
  border-radius: ${(props) => props.theme.borderRadius};
  font-size: 0.875rem;
  white-space: nowrap;
  z-index: 1000;
  opacity: ${(props) => (props.isVisible ? 1 : 0)};
  visibility: ${(props) => (props.isVisible ? "visible" : "hidden")};
  transition: all 0.2s ease-in-out;

  ${(props) => {
    switch (props.position) {
      case "bottom":
        return `
          top: 100%;
          left: 50%;
          transform: translateX(-50%);
          margin-top: ${SPACING.xs};
        `;
      case "left":
        return `
          top: 50%;
          right: 100%;
          transform: translateY(-50%);
          margin-right: ${SPACING.xs};
        `;
      case "right":
        return `
          top: 50%;
          left: 100%;
          transform: translateY(-50%);
          margin-left: ${SPACING.xs};
        `;
      default: // top
        return `
          bottom: 100%;
          left: 50%;
          transform: translateX(-50%);
          margin-bottom: ${SPACING.xs};
        `;
    }
  }}

  &::after {
    content: "";
    position: absolute;
    border: 5px solid transparent;

    ${(props) => {
      switch (props.position) {
        case "bottom":
          return `
            bottom: 100%;
            left: 50%;
            transform: translateX(-50%);
            border-bottom-color: ${props.theme.colors.text.primary};
          `;
        case "left":
          return `
            left: 100%;
            top: 50%;
            transform: translateY(-50%);
            border-left-color: ${props.theme.colors.text.primary};
          `;
        case "right":
          return `
            right: 100%;
            top: 50%;
            transform: translateY(-50%);
            border-right-color: ${props.theme.colors.text.primary};
          `;
        default: // top
          return `
            top: 100%;
            left: 50%;
            transform: translateX(-50%);
            border-top-color: ${props.theme.colors.text.primary};
          `;
      }
    }}
  }
`;

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  position = "top",
  children,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <TooltipWrapper
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      <TooltipContent isVisible={isVisible} position={position}>
        {content}
      </TooltipContent>
    </TooltipWrapper>
  );
};
