import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  Tooltip,
  CircularProgress,
} from "@mui/material";
import {
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  FilterList as FilterListIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

// Define token interface
export interface Token {
  id: string;
  name: string;
  symbol: string;
  address: string;
  totalSupply: string;
  decimals: number;
  createdAt: string;
  owner: string;
  type?: "standard" | "mintable" | "burnable" | "capped";
  network?: {
    id: number;
    name: string;
  };
}

interface TokenListProps {
  tokens?: Token[];
  isLoading?: boolean;
  onViewToken?: (token: Token) => void;
  onEditToken?: (token: Token) => void;
  onDeleteToken?: (token: Token) => void;
}

export const TokenList: React.FC<TokenListProps> = ({
  tokens = [],
  isLoading = false,
  onViewToken,
  onEditToken,
  onDeleteToken,
}) => {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [displayTokens, setDisplayTokens] = useState<Token[]>([]);

  // Sample tokens for demonstration
  const sampleTokens: Token[] = [
    {
      id: "1",
      name: "TokenForge Coin",
      symbol: "TFC",
      address: "0x1234567890123456789012345678901234567890",
      totalSupply: "1000000",
      decimals: 18,
      createdAt: "2023-01-15",
      owner: "0xabcdef1234567890abcdef1234567890abcdef12",
      type: "standard",
      network: {
        id: 1,
        name: "Ethereum",
      },
    },
    {
      id: "2",
      name: "Mintable Token",
      symbol: "MINT",
      address: "0x2345678901234567890123456789012345678901",
      totalSupply: "500000",
      decimals: 18,
      createdAt: "2023-02-20",
      owner: "0xabcdef1234567890abcdef1234567890abcdef12",
      type: "mintable",
      network: {
        id: 137,
        name: "Polygon",
      },
    },
    {
      id: "3",
      name: "Burnable Token",
      symbol: "BURN",
      address: "0x3456789012345678901234567890123456789012",
      totalSupply: "750000",
      decimals: 18,
      createdAt: "2023-03-10",
      owner: "0xabcdef1234567890abcdef1234567890abcdef12",
      type: "burnable",
      network: {
        id: 56,
        name: "BSC",
      },
    },
  ];

  useEffect(() => {
    // Use provided tokens or sample tokens if none provided
    setDisplayTokens(tokens.length > 0 ? tokens : sampleTokens);
  }, [tokens]);

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleViewToken = (token: Token) => {
    if (onViewToken) {
      onViewToken(token);
    } else {
      navigate(`/tokens/${token.id}`);
    }
  };

  const handleEditToken = (token: Token) => {
    if (onEditToken) {
      onEditToken(token);
    } else {
      navigate(`/tokens/${token.id}/edit`);
    }
  };

  const handleDeleteToken = (token: Token) => {
    if (onDeleteToken) {
      onDeleteToken(token);
    }
  };

  // Function to truncate address for display
  const truncateAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(
      address.length - 4
    )}`;
  };

  // Get token type color
  const getTokenTypeColor = (type?: string) => {
    switch (type) {
      case "standard":
        return "primary";
      case "mintable":
        return "success";
      case "burnable":
        return "warning";
      case "capped":
        return "info";
      default:
        return "default";
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (displayTokens.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: "center" }}>
        <Typography variant="body1" color="text.secondary">
          Aucun token trouvé
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ width: "100%", overflow: "hidden" }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          p: 2,
        }}
      >
        <Typography variant="h6">Tokens</Typography>
        <Tooltip title="Filtrer la liste">
          <IconButton>
            <FilterListIcon />
          </IconButton>
        </Tooltip>
      </Box>
      <TableContainer>
        <Table stickyHeader aria-label="sticky table">
          <TableHead>
            <TableRow>
              <TableCell>Nom</TableCell>
              <TableCell>Symbole</TableCell>
              <TableCell>Adresse</TableCell>
              <TableCell>Réseau</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {displayTokens
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((token) => (
                <TableRow hover key={token.id}>
                  <TableCell>{token.name}</TableCell>
                  <TableCell>{token.symbol}</TableCell>
                  <TableCell>
                    <Tooltip title={token.address}>
                      <span>{truncateAddress(token.address)}</span>
                    </Tooltip>
                  </TableCell>
                  <TableCell>{token.network?.name || "Ethereum"}</TableCell>
                  <TableCell>
                    <Chip
                      label={token.type || "standard"}
                      color={
                        getTokenTypeColor(token.type) as
                          | "primary"
                          | "success"
                          | "warning"
                          | "info"
                          | "default"
                          | undefined
                      }
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", gap: 1 }}>
                      <Tooltip title="Voir les détails">
                        <IconButton
                          size="small"
                          onClick={() => handleViewToken(token)}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Modifier">
                        <IconButton
                          size="small"
                          onClick={() => handleEditToken(token)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Supprimer">
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteToken(token)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={displayTokens.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage="Lignes par page:"
        labelDisplayedRows={({ from, to, count }) =>
          `${from}-${to} sur ${count}`
        }
      />
    </Paper>
  );
};
