// src/App.tsx
import { Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import { theme } from "./theme";
import { Layout } from "./components/Layout";
import { Home } from "./pages/Home";
import { CreateToken } from "./pages/CreateToken";
import { MyTokens } from "./pages/MyTokens";
import { TokenDetailsPage } from "./pages/TokenDetails";
import { Web3Provider } from "./contexts/Web3Provider";
import { QueryProvider } from "./providers/QueryProvider";

const App = () => {
  return (
    <QueryProvider>
      <Web3Provider>
        <ThemeProvider theme={theme}>
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/create" element={<CreateToken />} />
              <Route path="/tokens" element={<MyTokens />} />
              <Route path="/tokens/:address" element={<TokenDetailsPage />} />
            </Routes>
          </Layout>
        </ThemeProvider>
      </Web3Provider>
    </QueryProvider>
  );
};

export default App;
