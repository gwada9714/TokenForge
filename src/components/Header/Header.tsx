import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { InjectedConnector } from "@wagmi/connectors/injected";

const Header = () => {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect({
    connector: new InjectedConnector(),
  });
  const { disconnect } = useDisconnect();

  const handleConnect = async () => {
    if (isConnected) {
      disconnect();
    } else {
      await connect();
    }
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          <RouterLink to="/" style={{ color: "inherit", textDecoration: "none" }}>
            TokenForge
          </RouterLink>
        </Typography>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            color="inherit"
            component={RouterLink}
            to="/create"
          >
            Create Token
          </Button>
          <Button
            color="inherit"
            component={RouterLink}
            to="/tokens"
          >
            My Tokens
          </Button>
          <Button color="inherit" onClick={handleConnect}>
            {isConnected
              ? `${address?.slice(0, 6)}...${address?.slice(-4)}`
              : "Connect Wallet"}
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
