import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
// Utiliser directement ethers sans hook personnalisé
import {
  Box,
  Button,
  Card,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  Grid,
  MenuItem,
  Select,
  Step,
  StepLabel,
  Stepper,
  Typography,
  IconButton,
  Tooltip,
  Chip,
} from "@mui/material";
import {
  CryptocurrencyInfo,
  PaymentSession,
  PaymentStatus,
} from "../../blockchain/types/payment";
import InfoIcon from "@mui/icons-material/Info";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

// ABI minimal pour ERC20
const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
];

interface PaymentFlowProps {
  productId: string;
  productType:
    | "token_creation"
    | "subscription"
    | "premium_service"
    | "marketplace";
  amount: number; // Montant en EUR
  onSuccess: (txHash: string) => void;
  onCancel: () => void;
}

const PaymentFlow: React.FC<PaymentFlowProps> = ({
  productId,
  productType,
  amount,
  onSuccess,
  onCancel,
}) => {
  // Simuler les valeurs qui seraient fournies par un hook de wallet
  const [account, setAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);

  // Fonction pour connecter le wallet
  // Cette fonction est définie mais pas utilisée directement dans ce composant
  // Elle pourrait être utilisée dans une implémentation future ou exposée via des props
  const _connectWallet = async () => {
    try {
      // Vérifier si MetaMask est installé
      if (window.ethereum) {
        // Demander la connexion à MetaMask
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });

        if (accounts.length > 0) {
          setAccount(accounts[0]);

          // Obtenir le chainId
          const chainIdHex = await window.ethereum.request({
            method: "eth_chainId",
          });
          setChainId(parseInt(chainIdHex, 16));

          // Créer un provider ethers
          const ethersProvider = new ethers.BrowserProvider(window.ethereum);
          setProvider(ethersProvider);
        }
      } else {
        throw new Error("MetaMask non détecté");
      }
    } catch (error) {
      console.error("Error connecting wallet:", error);
      setError("Impossible de connecter le wallet");
    }
  };

  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedNetwork, setSelectedNetwork] = useState<string>("ethereum");
  const [supportedNetworks, setSupportedNetworks] = useState<
    Array<{ id: string; name: string; chainId: number }>
  >([]);

  const [selectedCrypto, setSelectedCrypto] = useState<string>("");
  const [supportedCryptos, setSupportedCryptos] = useState<
    CryptocurrencyInfo[]
  >([]);

  const [paymentSession, setPaymentSession] = useState<PaymentSession | null>(
    null
  );
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | null>(
    null
  );

  const [txHash, setTxHash] = useState<string>("");
  const [isWrongNetwork, setIsWrongNetwork] = useState<boolean>(false);

  // Récupérer les réseaux supportés
  useEffect(() => {
    const fetchSupportedNetworks = async () => {
      try {
        const response = await fetch("/api/payments/networks");
        const data = await response.json();
        setSupportedNetworks(data.networks);

        // Sélectionner le réseau correspondant au chainId actuel si disponible
        if (chainId) {
          const matchingNetwork = data.networks.find(
            (n: any) => n.chainId === chainId
          );
          if (matchingNetwork) {
            setSelectedNetwork(matchingNetwork.id);
          } else {
            setIsWrongNetwork(true);
          }
        }
      } catch (error) {
        console.error("Failed to fetch supported networks:", error);
        setError("Impossible de récupérer les réseaux supportés.");
      }
    };

    fetchSupportedNetworks();
  }, [chainId]);

  // Vérifier si le réseau est correct
  useEffect(() => {
    if (chainId && supportedNetworks.length > 0) {
      const network = supportedNetworks.find((n) => n.id === selectedNetwork);
      setIsWrongNetwork(network?.chainId !== chainId);
    }
  }, [chainId, selectedNetwork, supportedNetworks]);

  // Récupérer les cryptos supportées pour le réseau sélectionné
  useEffect(() => {
    const fetchSupportedCryptos = async () => {
      if (!selectedNetwork) return;

      setLoading(true);
      try {
        const response = await fetch(
          `/api/payments/cryptocurrencies?network=${selectedNetwork}`
        );
        const data = await response.json();

        setSupportedCryptos(data.cryptocurrencies);

        // Sélectionner par défaut la crypto native (ETH, BNB, etc.)
        const nativeCrypto = data.cryptocurrencies.find(
          (c: CryptocurrencyInfo) => c.isNative
        );
        if (nativeCrypto && !selectedCrypto) {
          setSelectedCrypto(nativeCrypto.symbol);
        }
      } catch (error) {
        console.error("Failed to fetch supported cryptocurrencies:", error);
        setError("Impossible de récupérer les cryptomonnaies supportées.");
      } finally {
        setLoading(false);
      }
    };

    fetchSupportedCryptos();
  }, [selectedNetwork]);

  // Initialiser une session de paiement
  const initPaymentSession = async () => {
    if (!account) {
      setError("Veuillez connecter votre wallet.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Appel à l'API pour créer une session de paiement
      const response = await fetch("/api/payments/create-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`, // Ajouter le token d'authentification
        },
        body: JSON.stringify({
          productId,
          productType,
          amount,
          network: selectedNetwork,
          currency: selectedCrypto,
          payerAddress: account,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Erreur lors de la création de la session de paiement"
        );
      }

      setPaymentSession(data.session);
      setActiveStep(1); // Passer à l'étape suivante
    } catch (error) {
      console.error("Error creating payment session:", error);
      setError((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour changer de réseau
  const switchNetwork = async (networkId: string) => {
    try {
      const network = supportedNetworks.find((n) => n.id === networkId);
      if (!network) {
        throw new Error("Réseau non supporté");
      }

      if (!window.ethereum) {
        throw new Error("MetaMask non détecté");
      }

      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: `0x${network.chainId.toString(16)}` }],
      });
    } catch (error) {
      console.error("Error switching network:", error);
      setError(
        "Impossible de changer de réseau. Veuillez le faire manuellement dans votre wallet."
      );
    }
  };

  // Envoyer le paiement
  const sendPayment = async () => {
    if (!account || !provider || !paymentSession) {
      setError("Portefeuille non connecté ou session de paiement invalide");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Vérifier que l'utilisateur est sur le bon réseau
      const network = supportedNetworks.find((n) => n.id === selectedNetwork);
      if (chainId !== network?.chainId) {
        setError(`Veuillez changer de réseau pour ${network?.name}`);
        setIsWrongNetwork(true);
        return;
      }

      const signer = await provider.getSigner();
      const currency = paymentSession.currency;

      if (currency.isNative) {
        // Paiement en crypto native (ETH, BNB, etc.)
        const tx = await signer.sendTransaction({
          to: paymentSession.receivingAddress,
          value: BigInt(paymentSession.amountDue.amount),
        });

        setTxHash(tx.hash);
        setActiveStep(2); // Passer à l'étape de confirmation

        // Attendre la confirmation
        await tx.wait(1);

        // Notifier le backend
        await confirmPaymentOnBackend(tx.hash);
      } else {
        // Paiement en token (USDT, etc.)
        const tokenContract = new ethers.Contract(
          currency.address as string,
          ERC20_ABI,
          signer
        );

        // Envoyer la transaction
        const tx = await tokenContract.transfer(
          paymentSession.receivingAddress,
          paymentSession.amountDue.amount
        );

        setTxHash(tx.hash);
        setActiveStep(2); // Passer à l'étape de confirmation

        // Attendre la confirmation
        await tx.wait(1);

        // Notifier le backend
        await confirmPaymentOnBackend(tx.hash);
      }
    } catch (error) {
      console.error("Error sending payment:", error);
      setError((error as any).message || "Erreur lors de l'envoi du paiement");
    } finally {
      setLoading(false);
    }
  };

  // Confirmer le paiement sur le backend
  const confirmPaymentOnBackend = async (hash: string) => {
    if (!paymentSession) return;

    try {
      const response = await fetch("/api/payments/confirm", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId: paymentSession.sessionId,
          txHash: hash,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Erreur lors de la confirmation du paiement"
        );
      }

      // Vérifier périodiquement le statut du paiement
      checkPaymentStatus();
    } catch (error) {
      console.error("Error confirming payment:", error);
      setError((error as Error).message);
    }
  };

  // Vérifier le statut du paiement
  const checkPaymentStatus = async () => {
    if (!paymentSession) return;

    const intervalId = setInterval(async () => {
      try {
        const response = await fetch(
          `/api/payments/status?sessionId=${paymentSession.sessionId}`
        );
        const data = await response.json();

        setPaymentStatus(data.status);

        if (data.status === PaymentStatus.COMPLETED) {
          clearInterval(intervalId);
          onSuccess(txHash);
        } else if (
          data.status === PaymentStatus.FAILED ||
          data.status === PaymentStatus.EXPIRED
        ) {
          clearInterval(intervalId);
          setError("Le paiement a échoué ou a expiré. Veuillez réessayer.");
        }
      } catch (error) {
        console.error("Error checking payment status:", error);
        clearInterval(intervalId);
      }
    }, 5000); // Vérifier toutes les 5 secondes

    // Nettoyer l'intervalle lors du démontage du composant
    return () => clearInterval(intervalId);
  };

  // Copier dans le presse-papier
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  // Rendu de l'étape de sélection du réseau et de la crypto
  const renderNetworkSelection = () => (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Sélectionnez votre méthode de paiement
      </Typography>

      {!account && (
        <Box sx={{ mb: 3, p: 2, bgcolor: "warning.light", borderRadius: 1 }}>
          <Typography variant="body2">
            Veuillez connecter votre wallet pour continuer.
          </Typography>
        </Box>
      )}

      <FormControl fullWidth sx={{ mb: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          Réseau Blockchain
        </Typography>
        <Select
          value={selectedNetwork}
          onChange={(e) => {
            setSelectedNetwork(e.target.value);
            setSelectedCrypto(""); // Réinitialiser la sélection de crypto
          }}
          disabled={loading}
        >
          {supportedNetworks.map((network) => (
            <MenuItem key={network.id} value={network.id}>
              {network.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl fullWidth sx={{ mb: 3 }}>
        <Typography variant="subtitle2" gutterBottom>
          Cryptomonnaie
        </Typography>
        <Select
          value={selectedCrypto}
          onChange={(e) => setSelectedCrypto(e.target.value)}
          disabled={loading || supportedCryptos.length === 0}
        >
          {supportedCryptos.map((crypto) => (
            <MenuItem key={crypto.symbol} value={crypto.symbol}>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <img
                  src={crypto.logoUrl}
                  alt={crypto.symbol}
                  style={{ width: 24, height: 24, marginRight: 8 }}
                />
                {crypto.name} ({crypto.symbol})
                {crypto.isStablecoin && (
                  <Chip
                    label="Stablecoin"
                    size="small"
                    color="primary"
                    sx={{ ml: 1 }}
                  />
                )}
              </Box>
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Typography variant="subtitle1" gutterBottom>
        Montant à payer: <strong>{amount.toFixed(2)} EUR</strong>
      </Typography>

      <Button
        variant="contained"
        fullWidth
        onClick={initPaymentSession}
        disabled={loading || !selectedNetwork || !selectedCrypto || !account}
      >
        {loading ? <CircularProgress size={24} /> : "Continuer"}
      </Button>
    </Box>
  );

  // Rendu de l'étape de paiement
  const renderPaymentDetails = () => (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Détails du paiement
      </Typography>

      {isWrongNetwork && (
        <Box sx={{ mb: 3, p: 2, bgcolor: "error.light", borderRadius: 1 }}>
          <Typography variant="body2" sx={{ mb: 1 }}>
            Vous êtes sur le mauvais réseau. Veuillez changer pour{" "}
            {supportedNetworks.find((n) => n.id === selectedNetwork)?.name}.
          </Typography>
          <Button
            variant="contained"
            size="small"
            onClick={() => switchNetwork(selectedNetwork)}
          >
            Changer de réseau
          </Button>
        </Box>
      )}

      {paymentSession && (
        <>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">
                Montant
              </Typography>
              <Typography variant="body1" fontWeight="bold">
                {paymentSession.amountDue.formatted}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                ≈ {paymentSession.amountDue.valueEUR.toFixed(2)} EUR
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">
                Blockchain
              </Typography>
              <Typography variant="body1">
                {supportedNetworks.find((n) => n.id === selectedNetwork)?.name}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary">
                Adresse de réception
                <Tooltip title="Copier l'adresse">
                  <IconButton
                    size="small"
                    onClick={() =>
                      copyToClipboard(paymentSession.receivingAddress)
                    }
                  >
                    <ContentCopyIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Typography>
              <Typography variant="body1" sx={{ wordBreak: "break-all" }}>
                {paymentSession.receivingAddress}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary">
                Expire le
              </Typography>
              <Typography variant="body1">
                {new Date(paymentSession.expiresAt * 1000).toLocaleString()}
              </Typography>
            </Grid>
          </Grid>

          <Divider sx={{ my: 2 }} />

          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" color="info.main" sx={{ mb: 1 }}>
              <InfoIcon
                fontSize="small"
                sx={{ verticalAlign: "middle", mr: 0.5 }}
              />
              Le montant inclut une petite marge pour couvrir la volatilité des
              prix.
            </Typography>
          </Box>

          <Button
            variant="contained"
            fullWidth
            onClick={sendPayment}
            disabled={loading || isWrongNetwork}
          >
            {loading ? (
              <CircularProgress size={24} />
            ) : (
              `Payer avec ${paymentSession.currency.symbol}`
            )}
          </Button>
        </>
      )}
    </Box>
  );

  // Rendu de l'étape de confirmation
  const renderConfirmation = () => (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Confirmation du paiement
      </Typography>

      {txHash && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" color="text.secondary">
            Hash de transaction
            <Tooltip title="Copier le hash">
              <IconButton size="small" onClick={() => copyToClipboard(txHash)}>
                <ContentCopyIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Typography>
          <Typography variant="body1" sx={{ wordBreak: "break-all" }}>
            {txHash}
          </Typography>

          <Box
            sx={{
              mt: 3,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            {paymentStatus === PaymentStatus.CONFIRMING && (
              <>
                <CircularProgress size={40} sx={{ mb: 2 }} />
                <Typography>
                  Confirmation de la transaction en cours...
                </Typography>
              </>
            )}

            {paymentStatus === PaymentStatus.COMPLETED && (
              <>
                <Box sx={{ color: "success.main", fontSize: 48, mb: 2 }}>✓</Box>
                <Typography variant="h6" color="success.main">
                  Paiement confirmé !
                </Typography>
              </>
            )}
          </Box>
        </Box>
      )}

      <Button
        variant="contained"
        fullWidth
        onClick={() =>
          paymentStatus === PaymentStatus.COMPLETED ? onSuccess(txHash) : null
        }
        disabled={paymentStatus !== PaymentStatus.COMPLETED}
      >
        Continuer
      </Button>
    </Box>
  );

  return (
    <Dialog open maxWidth="sm" fullWidth>
      <DialogTitle>
        Paiement{" "}
        {productType === "token_creation"
          ? "Création de token"
          : productType === "subscription"
          ? "Abonnement"
          : productType === "premium_service"
          ? "Service Premium"
          : "Marketplace"}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ width: "100%" }}>
          <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
            <Step>
              <StepLabel>Méthode</StepLabel>
            </Step>
            <Step>
              <StepLabel>Paiement</StepLabel>
            </Step>
            <Step>
              <StepLabel>Confirmation</StepLabel>
            </Step>
          </Stepper>

          <Card>
            {error && (
              <Box
                sx={{
                  p: 2,
                  bgcolor: "error.light",
                  color: "error.contrastText",
                  mb: 2,
                }}
              >
                <Typography>{error}</Typography>
              </Box>
            )}

            {activeStep === 0 && renderNetworkSelection()}
            {activeStep === 1 && renderPaymentDetails()}
            {activeStep === 2 && renderConfirmation()}
          </Card>

          <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
            <Button onClick={onCancel} color="inherit">
              Annuler
            </Button>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentFlow;
