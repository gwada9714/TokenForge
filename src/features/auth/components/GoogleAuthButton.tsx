import React from "react";
import { Button, CircularProgress } from "@mui/material";
import { styled } from "@mui/material/styles";
import { useFirebaseAuth } from "../hooks/useFirebaseAuth";

const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.spacing(3),
  padding: theme.spacing(1, 2),
  textTransform: "none",
  backgroundColor: "#fff",
  color: "#3c4043",
  border: "1px solid #dadce0",
  boxShadow: "rgba(0, 0, 0, 0.05) 0px 1px 2px 0px",
  "&:hover": {
    backgroundColor: "#f8f9fa",
    borderColor: "#dadce0",
    boxShadow:
      "rgba(0, 0, 0, 0.1) 0px 1px 3px 0px, rgba(0, 0, 0, 0.05) 0px 1px 2px 0px",
  },
  "& .MuiButton-startIcon": {
    marginRight: theme.spacing(1.5),
    "& svg": {
      width: 20,
      height: 20,
    },
  },
}));

const GoogleLogo = () => (
  <svg
    width="18"
    height="18"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 48 48"
  >
    <path
      fill="#EA4335"
      d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
    />
    <path
      fill="#4285F4"
      d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
    />
    <path
      fill="#FBBC05"
      d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
    />
    <path
      fill="#34A853"
      d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
    />
  </svg>
);

interface GoogleAuthButtonProps {
  variant?: "text" | "outlined" | "contained";
  size?: "small" | "medium" | "large";
  fullWidth?: boolean;
}

export const GoogleAuthButton: React.FC<GoogleAuthButtonProps> = ({
  variant = "outlined",
  size = "medium",
  fullWidth = false,
}) => {
  const { user, isLoading, signInWithGoogle } = useFirebaseAuth();

  const handleClick = async () => {
    if (!user) {
      try {
        await signInWithGoogle();
      } catch (error) {
        // console.error('Failed to sign in with Google:', error);
      }
    }
  };

  // Ne pas afficher si déjà connecté
  if (user) return null;

  return (
    <StyledButton
      variant={variant}
      size={size}
      fullWidth={fullWidth}
      onClick={handleClick}
      startIcon={
        isLoading ? (
          <CircularProgress size={20} color="inherit" />
        ) : (
          <GoogleLogo />
        )
      }
      disabled={isLoading}
    >
      Continue with Google
    </StyledButton>
  );
};
