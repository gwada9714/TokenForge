import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { SignUpPage } from "../SignUpPage";
import { TokenForgeAuthProvider } from "../../../features/auth";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", () => ({
  ...vi.importActual("react-router-dom"),
  useNavigate: () => mockNavigate,
  useLocation: () => ({ state: { from: { pathname: "/dashboard" } } }),
}));

describe("SignUpPage", () => {
  beforeEach(() => {
    render(
      <BrowserRouter>
        <TokenForgeAuthProvider>
          <SignUpPage />
        </TokenForgeAuthProvider>
      </BrowserRouter>
    );
  });

  it("renders signup form", () => {
    expect(screen.getByText("Create Account")).toBeTruthy();
    expect(screen.getByLabelText(/email/i)).toBeTruthy();
    expect(screen.getByLabelText(/^password$/i)).toBeTruthy();
    expect(screen.getByLabelText(/confirm password/i)).toBeTruthy();
  });

  it("has sign in link", () => {
    const signInLink = screen.getByText(/already have an account\?/i);
    expect(signInLink).toBeTruthy();
    expect(signInLink.closest("a")).toHaveAttribute("href", "/login");
  });
});
