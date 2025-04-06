import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CreateToken } from "../CreateToken";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import { theme } from "../../styles/theme";
import { Web3Provider } from "../../contexts/Web3Provider";

// Mock des composants de formulaire
vi.mock("../../components/CreateTokenForm/BasicTokenForm", () => ({
  BasicTokenForm: () => <div data-testid="basic-form">Basic Form</div>,
}));

vi.mock("../../components/CreateTokenForm/AdvancedTokenForm", () => ({
  AdvancedTokenForm: () => <div data-testid="advanced-form">Advanced Form</div>,
}));

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <Web3Provider>{component}</Web3Provider>
      </ThemeProvider>
    </BrowserRouter>
  );
};

describe("CreateToken Page", () => {
  beforeEach(() => {
    renderWithProviders(<CreateToken />);
  });

  it("renders the page title", () => {
    expect(screen.getByText("Create Your Token")).toBeTruthy();
  });

  it("displays all token types", () => {
    expect(screen.getByText("ERC20 Token")).toBeTruthy();
    expect(screen.getByText("ERC721 NFT")).toBeTruthy();
    expect(screen.getByText("ERC1155 Multi Token")).toBeTruthy();
    expect(screen.getByText("ERC777 Advanced Token")).toBeTruthy();
    expect(screen.getByText("ERC4626 Tokenized Vault")).toBeTruthy();
  });

  it("shows difficulty levels for each token type", () => {
    expect(screen.getByText("Beginner Level")).toBeTruthy();
    expect(screen.getByText("Intermediate Level")).toBeTruthy();
    expect(screen.getByText("Advanced Level")).toBeTruthy();
    expect(screen.getByText("Expert Level")).toBeTruthy();
  });

  it("allows token type selection", async () => {
    const erc20Card = screen.getByText("ERC20 Token").closest(".MuiCard-root");
    expect(erc20Card).toBeTruthy();

    if (erc20Card) {
      fireEvent.click(erc20Card);
      expect(erc20Card).toHaveStyle({
        borderColor: expect.stringContaining("#"),
      });
    }
  });

  it("shows stepper with correct steps", () => {
    expect(screen.getByText("Select Token Type")).toBeTruthy();
    expect(screen.getByText("Configure Token")).toBeTruthy();
    expect(screen.getByText("Review & Deploy")).toBeTruthy();
  });

  it("disables Next button until token type is selected", () => {
    const nextButton = screen.getByText("Next");
    expect(nextButton).toBeDisabled();

    const erc20Card = screen.getByText("ERC20 Token").closest(".MuiCard-root");
    if (erc20Card) {
      fireEvent.click(erc20Card);
      expect(nextButton).not.toBeDisabled();
    }
  });

  it("shows basic form by default and allows switching to advanced mode", async () => {
    // Select token type first
    const erc20Card = screen.getByText("ERC20 Token").closest(".MuiCard-root");
    if (erc20Card) {
      fireEvent.click(erc20Card);
    }

    // Go to next step
    const nextButton = screen.getByText("Next");
    fireEvent.click(nextButton);

    // Check basic form is shown by default
    expect(screen.getByTestId("basic-form")).toBeTruthy();

    // Switch to advanced mode
    const switchModeButton = screen.getByText("Switch to Advanced Mode");
    fireEvent.click(switchModeButton);

    // Check advanced form is shown
    expect(screen.getByTestId("advanced-form")).toBeTruthy();
  });

  it("allows navigation between steps", async () => {
    // Select token type
    const erc20Card = screen.getByText("ERC20 Token").closest(".MuiCard-root");
    if (erc20Card) {
      fireEvent.click(erc20Card);
    }

    // Go to next step
    const nextButton = screen.getByText("Next");
    fireEvent.click(nextButton);

    // Check we're on the second step
    expect(screen.getByTestId("basic-form")).toBeTruthy();

    // Go back
    const backButton = screen.getByText("Back");
    fireEvent.click(backButton);

    // Check we're back on the first step
    expect(screen.getByText("ERC20 Token")).toBeTruthy();
  });

  it("shows deploy button on final step", async () => {
    // Select token type
    const erc20Card = screen.getByText("ERC20 Token").closest(".MuiCard-root");
    if (erc20Card) {
      fireEvent.click(erc20Card);
    }

    // Navigate to last step
    const nextButton = screen.getByText("Next");
    fireEvent.click(nextButton);
    fireEvent.click(nextButton);

    // Check deploy button is shown
    expect(screen.getByText("Deploy")).toBeTruthy();
  });
});

// Test des interactions avec Web3
describe("CreateToken Web3 Integration", () => {
  it("handles wallet connection", async () => {
    renderWithProviders(<CreateToken />);

    // Note: Ces tests dépendront de votre implémentation spécifique de Web3
    // et devront être adaptés en fonction de votre logique de connexion

    // Exemple:
    // const connectButton = screen.getByText('Connect Wallet');
    // fireEvent.click(connectButton);
    // await waitFor(() => {
    //   expect(screen.getByText('Connected')).toBeTruthy();
    // });
  });
});
