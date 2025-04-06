import React from "react";
import { Collapse, Fade, Grow } from "@mui/material";

interface AuthTransitionProps {
  children: React.ReactNode;
  type?: "fade" | "collapse" | "grow";
  in: boolean;
  timeout?: number;
}

export const AuthTransition: React.FC<AuthTransitionProps> = ({
  children,
  type = "fade",
  in: inProp,
  timeout = 300,
}) => {
  const TransitionComponent = {
    fade: Fade,
    collapse: Collapse,
    grow: Grow,
  }[type];

  return (
    <TransitionComponent in={inProp} timeout={timeout} unmountOnExit>
      <div>{children}</div>
    </TransitionComponent>
  );
};
