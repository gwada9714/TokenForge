import React from "react";
import { Snackbar, Alert, AlertProps } from "@mui/material";

interface ToastProps extends Omit<AlertProps, "children"> {
  open: boolean;
  message: string;
  autoHideDuration?: number;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({
  open,
  message,
  severity = "success",
  autoHideDuration = 6000,
  onClose,
  ...alertProps
}) => {
  return (
    <Snackbar
      open={open}
      autoHideDuration={autoHideDuration}
      onClose={onClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
    >
      <Alert
        onClose={onClose}
        severity={severity}
        variant="filled"
        sx={{ width: "100%" }}
        {...alertProps}
      >
        {message}
      </Alert>
    </Snackbar>
  );
};

export default Toast;
