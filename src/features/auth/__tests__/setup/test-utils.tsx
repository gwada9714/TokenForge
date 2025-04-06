import React from "react";
import { render, RenderOptions } from "@testing-library/react";
import { TokenForgeAuthProvider } from "../../providers/TokenForgeAuthProvider";

const AllTheProviders: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return <TokenForgeAuthProvider>{children}</TokenForgeAuthProvider>;
};

const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, "wrapper">
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from "@testing-library/react";
export { customRender as render };
