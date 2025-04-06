# Plan d'Implémentation de la Navbar

Basé sur l'analyse comparative entre la navbar actuelle et le plan détaillé, voici un plan d'implémentation progressif pour aligner la navbar avec les spécifications souhaitées.

## Phase 1 : Structure et Navigation

### 1.1 Ajout de la tagline

```tsx
// Dans la section Logo
<StyledRouterLink to="/">
  <LogoContainer>
    <TokenForgeLogo />
  </LogoContainer>
  <Box
    sx={{
      display: { xs: "none", md: "flex" },
      alignItems: "center",
      ml: 1.5,
      pl: 1.5,
      borderLeft: "1px solid",
      borderColor: "rgba(255, 255, 255, 0.15)",
    }}
  >
    <Typography
      variant="body2"
      sx={{
        fontFamily: '"Space Grotesk", sans-serif',
        fontWeight: 300,
        color: "rgba(248, 250, 252, 0.8)",
        letterSpacing: "0.02em",
      }}
    >
      Forge Your Token Future
    </Typography>
  </Box>
</StyledRouterLink>
```

### 1.2 Compléter les entrées de navigation

```tsx
// Ajouter ces entrées dans la section Desktop Menu
<NavButton
  component={RouterLink}
  to="/create-token"
>
  Créer un Token
</NavButton>

<NavButton
  component={RouterLink}
  to="/tokenomics"
>
  Tokenomics
</NavButton>

<NavButton
  component={RouterLink}
  to="/comparator"
>
  Comparateur
</NavButton>

<NavButton
  component={RouterLink}
  to="/resources"
>
  Ressources
</NavButton>
```

### 1.3 Ajouter les éléments manquants dans la zone droite

```tsx
// Ajouter avant le Wallet Status
<Box sx={{ display: "flex", alignItems: "center", mr: 2 }}>
  {/* Blockchain Selector */}
  <IconButton
    color="inherit"
    aria-label="select blockchain"
    sx={{
      position: "relative",
      mr: 1.5,
      "&:hover": { bgcolor: "rgba(255, 255, 255, 0.05)" },
    }}
  >
    <HexagonIcon sx={{ color: "#3498db", fontSize: 28 }} />
    <Box
      sx={{
        position: "absolute",
        width: 8,
        height: 8,
        borderRadius: "50%",
        bgcolor: isCorrectNetwork ? "success.main" : "error.main",
        bottom: 12,
        right: 12,
        border: "1px solid",
        borderColor: "background.paper",
      }}
    />
  </IconButton>

  {/* Search */}
  <IconButton
    color="inherit"
    aria-label="search"
    sx={{ mr: 1.5, "&:hover": { bgcolor: "rgba(255, 255, 255, 0.05)" } }}
  >
    <SearchIcon />
  </IconButton>

  {/* User Account */}
  <IconButton
    color="inherit"
    aria-label="account"
    sx={{ mr: 1.5, "&:hover": { bgcolor: "rgba(255, 255, 255, 0.05)" } }}
  >
    <AccountCircleIcon />
  </IconButton>
</Box>;

{
  /* CTA Principal */
}
<Button
  variant="contained"
  component={RouterLink}
  to="/create-token"
  sx={{
    mr: 2,
    px: 3,
    py: 1,
    borderRadius: 2,
    textTransform: "none",
    fontFamily: '"Space Grotesk", sans-serif',
    fontWeight: 600,
    fontSize: "0.95rem",
    background: "linear-gradient(45deg, #F59E0B 0%, #EA580C 100%)",
    boxShadow: "0 4px 10px rgba(245, 158, 11, 0.3)",
    "&:hover": {
      background: "linear-gradient(45deg, #F59E0B 30%, #EA580C 90%)",
      boxShadow: "0 6px 12px rgba(245, 158, 11, 0.4)",
      transform: "translateY(-1px)",
    },
  }}
>
  Forge ton Token
</Button>;
```

### 1.4 Améliorer les dropdowns avec plus de contenu

#### Services Dropdown

```tsx
// Remplacer le menu Services actuel par un mega menu
<StyledMenu
  anchorEl={servicesMenuAnchor}
  open={Boolean(servicesMenuAnchor)}
  onClose={handleMenuClose}
  anchorOrigin={{
    vertical: "bottom",
    horizontal: "center",
  }}
  transformOrigin={{
    vertical: "top",
    horizontal: "center",
  }}
  sx={{
    "& .MuiPaper-root": {
      width: 640,
      p: 3,
      mt: 1.5,
    },
  }}
>
  <Grid container spacing={2}>
    {/* Tokenomics Designer */}
    <Grid item xs={6} md={4}>
      <Box sx={{ p: 1.5, "&:hover": { bgcolor: "rgba(255, 255, 255, 0.05)" } }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
          <InsertChartIcon sx={{ color: "#F59E0B", mr: 1.5 }} />
          <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
            Tokenomics Designer
          </Typography>
        </Box>
        <Typography variant="body2" sx={{ color: "rgba(255, 255, 255, 0.7)" }}>
          Concevez l'économie parfaite pour votre token
        </Typography>
      </Box>
    </Grid>

    {/* Landing Page Builder */}
    <Grid item xs={6} md={4}>
      <Box sx={{ p: 1.5, "&:hover": { bgcolor: "rgba(255, 255, 255, 0.05)" } }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
          <WebIcon sx={{ color: "#F59E0B", mr: 1.5 }} />
          <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
            Landing Page Builder
          </Typography>
        </Box>
        <Typography variant="body2" sx={{ color: "rgba(255, 255, 255, 0.7)" }}>
          Créez une vitrine professionnelle sans coder
        </Typography>
      </Box>
    </Grid>

    {/* Auto-Liquidity Manager */}
    <Grid item xs={6} md={4}>
      <Box sx={{ p: 1.5, "&:hover": { bgcolor: "rgba(255, 255, 255, 0.05)" } }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
          <WaterIcon sx={{ color: "#F59E0B", mr: 1.5 }} />
          <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
            Auto-Liquidity Manager
          </Typography>
        </Box>
        <Typography variant="body2" sx={{ color: "rgba(255, 255, 255, 0.7)" }}>
          Gestion automatisée de la liquidité multi-DEX
        </Typography>
      </Box>
    </Grid>

    {/* Anti-Rugpull Protection */}
    <Grid item xs={6} md={4}>
      <Box sx={{ p: 1.5, "&:hover": { bgcolor: "rgba(255, 255, 255, 0.05)" } }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
          <ShieldIcon sx={{ color: "#F59E0B", mr: 1.5 }} />
          <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
            Anti-Rugpull Protection
          </Typography>
        </Box>
        <Typography variant="body2" sx={{ color: "rgba(255, 255, 255, 0.7)" }}>
          Sécurisez votre projet avec des mécanismes de confiance
        </Typography>
      </Box>
    </Grid>

    {/* Expert Network */}
    <Grid item xs={6} md={4}>
      <Box sx={{ p: 1.5, "&:hover": { bgcolor: "rgba(255, 255, 255, 0.05)" } }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
          <PeopleIcon sx={{ color: "#F59E0B", mr: 1.5 }} />
          <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
            Expert Network
          </Typography>
        </Box>
        <Typography variant="body2" sx={{ color: "rgba(255, 255, 255, 0.7)" }}>
          Accédez à notre réseau d'experts vérifiés
        </Typography>
      </Box>
    </Grid>

    {/* Token Spotlight */}
    <Grid item xs={6} md={4}>
      <Box sx={{ p: 1.5, "&:hover": { bgcolor: "rgba(255, 255, 255, 0.05)" } }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
          <HighlightIcon sx={{ color: "#F59E0B", mr: 1.5 }} />
          <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
            Token Spotlight
          </Typography>
        </Box>
        <Typography variant="body2" sx={{ color: "rgba(255, 255, 255, 0.7)" }}>
          Mettez en valeur votre projet auprès de notre communauté
        </Typography>
      </Box>
    </Grid>
  </Grid>
</StyledMenu>
```

#### Créer un Token Dropdown

```tsx
// Ajouter un nouveau dropdown pour "Créer un Token"
const [createTokenMenuAnchor, setCreateTokenMenuAnchor] =
  useState<null | HTMLElement>(null);

const handleCreateTokenMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
  setCreateTokenMenuAnchor(event.currentTarget);
};

// Dans la section des handlers
const handleMenuClose = () => {
  setServicesMenuAnchor(null);
  setCommunityMenuAnchor(null);
  setCreateTokenMenuAnchor(null);
};

// Dans la section des menus
<StyledMenu
  anchorEl={createTokenMenuAnchor}
  open={Boolean(createTokenMenuAnchor)}
  onClose={handleMenuClose}
  anchorOrigin={{
    vertical: "bottom",
    horizontal: "center",
  }}
  transformOrigin={{
    vertical: "top",
    horizontal: "center",
  }}
>
  <Box sx={{ p: 2, minWidth: 280 }}>
    <Typography
      variant="subtitle2"
      sx={{ mb: 2, color: "rgba(255, 255, 255, 0.6)", fontWeight: 400 }}
    >
      Choisissez votre blockchain
    </Typography>

    {/* Ethereum */}
    <MenuItem sx={{ py: 1.5, borderRadius: 1 }}>
      <Box sx={{ display: "flex", alignItems: "center", width: "100%" }}>
        <Box
          sx={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            bgcolor: "rgba(98, 126, 234, 0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mr: 2,
          }}
        >
          <img
            src="/images/ethereum.svg"
            alt="Ethereum"
            width={20}
            height={20}
          />
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography variant="body1">Ethereum</Typography>
          <Box sx={{ display: "flex", alignItems: "center", mt: 0.5 }}>
            <Typography
              variant="caption"
              sx={{ color: "rgba(255, 255, 255, 0.6)", mr: 1 }}
            >
              Complexité:
            </Typography>
            <Box sx={{ display: "flex" }}>
              <GavelIcon sx={{ fontSize: 14, color: "#F59E0B" }} />
              <GavelIcon sx={{ fontSize: 14, color: "#F59E0B" }} />
              <GavelIcon
                sx={{ fontSize: 14, color: "rgba(255, 255, 255, 0.3)" }}
              />
            </Box>
          </Box>
        </Box>
        <Box sx={{ ml: 2, color: "rgba(255, 255, 255, 0.5)" }}>
          <Typography variant="caption">~3 min</Typography>
        </Box>
      </Box>
    </MenuItem>

    {/* Binance Smart Chain */}
    <MenuItem sx={{ py: 1.5, borderRadius: 1, mt: 1 }}>
      <Box sx={{ display: "flex", alignItems: "center", width: "100%" }}>
        <Box
          sx={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            bgcolor: "rgba(243, 186, 47, 0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mr: 2,
          }}
        >
          <img src="/images/binance.svg" alt="Binance" width={20} height={20} />
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography variant="body1">Binance Smart Chain</Typography>
          <Box sx={{ display: "flex", alignItems: "center", mt: 0.5 }}>
            <Typography
              variant="caption"
              sx={{ color: "rgba(255, 255, 255, 0.6)", mr: 1 }}
            >
              Complexité:
            </Typography>
            <Box sx={{ display: "flex" }}>
              <GavelIcon sx={{ fontSize: 14, color: "#F59E0B" }} />
              <GavelIcon
                sx={{ fontSize: 14, color: "rgba(255, 255, 255, 0.3)" }}
              />
              <GavelIcon
                sx={{ fontSize: 14, color: "rgba(255, 255, 255, 0.3)" }}
              />
            </Box>
          </Box>
        </Box>
        <Box sx={{ ml: 2, color: "rgba(255, 255, 255, 0.5)" }}>
          <Typography variant="caption">~2 min</Typography>
        </Box>
      </Box>
    </MenuItem>

    {/* Polygon */}
    <MenuItem sx={{ py: 1.5, borderRadius: 1, mt: 1 }}>
      <Box sx={{ display: "flex", alignItems: "center", width: "100%" }}>
        <Box
          sx={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            bgcolor: "rgba(130, 71, 229, 0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mr: 2,
          }}
        >
          <img src="/images/polygon.svg" alt="Polygon" width={20} height={20} />
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography variant="body1">Polygon</Typography>
          <Box sx={{ display: "flex", alignItems: "center", mt: 0.5 }}>
            <Typography
              variant="caption"
              sx={{ color: "rgba(255, 255, 255, 0.6)", mr: 1 }}
            >
              Complexité:
            </Typography>
            <Box sx={{ display: "flex" }}>
              <GavelIcon sx={{ fontSize: 14, color: "#F59E0B" }} />
              <GavelIcon
                sx={{ fontSize: 14, color: "rgba(255, 255, 255, 0.3)" }}
              />
              <GavelIcon
                sx={{ fontSize: 14, color: "rgba(255, 255, 255, 0.3)" }}
              />
            </Box>
          </Box>
        </Box>
        <Box sx={{ ml: 2, color: "rgba(255, 255, 255, 0.5)" }}>
          <Typography variant="caption">~1 min</Typography>
        </Box>
      </Box>
    </MenuItem>
  </Box>
</StyledMenu>;
```

## Phase 2 : Style et Effets Visuels

### 2.1 Intégrer la texture "circuit" en arrière-plan

```tsx
// Ajouter dans le style de l'AppBar
<AppBar
  position="fixed"
  sx={{
    background: `linear-gradient(to right, rgba(24, 32, 56, 0.95), rgba(30, 41, 67, 0.95))`,
    backgroundImage: `
      linear-gradient(to right, rgba(24, 32, 56, 0.95), rgba(30, 41, 67, 0.95)),
      url('/images/circuit-pattern.svg')
    `,
    backgroundSize: 'cover, 400px',
    backgroundBlendMode: 'normal, overlay',
    backdropFilter: 'blur(8px)',
    boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
    height: NAVBAR_HEIGHT,
    borderBottom: '1px solid',
    borderColor: 'rgba(71, 85, 105, 0.15)',
  }}
>
```

### 2.2 Améliorer les animations

```tsx
// Modifier l'animation du logo
const glowAnimation = keyframes`
  0% { filter: brightness(1) drop-shadow(0 0 0px rgba(245, 158, 11, 0)); }
  50% { filter: brightness(1.2) drop-shadow(0 0 8px rgba(245, 158, 11, 0.4)); }
  100% { filter: brightness(1) drop-shadow(0 0 0px rgba(245, 158, 11, 0)); }
`;

// Modifier le NavButton pour améliorer l'effet hover
const NavButton = styled(Button, {
  shouldForwardProp: (prop) =>
    !["component", "to", "$loading"].includes(prop as string),
})<NavButtonProps>(({ theme, $loading }) => ({
  color: alpha(theme.palette.common.white, 0.85),
  marginLeft: theme.spacing(2),
  fontFamily: '"Space Grotesk", "Poppins", sans-serif',
  fontWeight: 500,
  position: "relative",
  textTransform: "none",
  opacity: $loading ? 0.7 : 1,
  pointerEvents: $loading ? "none" : "auto",
  transition: "all 0.2s ease",
  "&::after": {
    content: '""',
    position: "absolute",
    width: "0%",
    height: "2px",
    bottom: 0,
    left: "50%",
    transform: "translateX(-50%)",
    backgroundColor: "#F59E0B",
    transition: "width 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
  },
  "&:hover": {
    color: "#FFFFFF",
    backgroundColor: "transparent",
    boxShadow: "0 0 8px rgba(245, 158, 11, 0.3)",
    "&::after": {
      width: "80%",
    },
  },
  "&.active": {
    color: "#FFFFFF",
    "&::after": {
      width: "100%",
    },
    boxShadow: "0 0 12px rgba(245, 158, 11, 0.4)",
  },
}));
```

## Phase 3 : Fonctionnalités Avancées

### 3.1 Implémenter le sélecteur de blockchain avec les hexagones

```tsx
// Composant HexagonSelector
const HexagonSelector = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <IconButton
        onClick={handleClick}
        sx={{
          position: "relative",
          transition: "transform 0.3s ease",
          "&:hover": {
            transform: "rotate(30deg)",
          },
        }}
      >
        <HexagonIcon sx={{ color: "#3498db", fontSize: 28 }} />
        <Box
          sx={{
            position: "absolute",
            width: 8,
            height: 8,
            borderRadius: "50%",
            bgcolor: "success.main",
            bottom: 12,
            right: 12,
            border: "1px solid",
            borderColor: "background.paper",
          }}
        />
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          sx: {
            bgcolor: "rgba(15, 23, 42, 0.95)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(212, 175, 55, 0.3)",
            borderRadius: 2,
            mt: 1.5,
            p: 2,
            minWidth: 280,
          },
        }}
      >
        <Typography
          variant="subtitle2"
          sx={{ mb: 2, color: "rgba(255, 255, 255, 0.6)", px: 1 }}
        >
          Sélectionner une blockchain
        </Typography>

        <Grid container spacing={2}>
          {[
            "Ethereum",
            "Binance",
            "Polygon",
            "Avalanche",
            "Arbitrum",
            "Optimism",
          ].map((chain, index) => (
            <Grid item xs={4} key={chain}>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  p: 1,
                  borderRadius: 1,
                  cursor: "pointer",
                  "&:hover": {
                    bgcolor: "rgba(255, 255, 255, 0.05)",
                  },
                }}
              >
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mb: 1,
                  }}
                >
                  <img
                    src={`/images/${chain.toLowerCase()}.svg`}
                    alt={chain}
                    width={32}
                    height={32}
                  />
                </Box>
                <Typography variant="caption" sx={{ textAlign: "center" }}>
                  {chain}
                </Typography>
                <Box sx={{ display: "flex", mt: 0.5 }}>
                  {Array((index % 3) + 1)
                    .fill(0)
                    .map((_, i) => (
                      <AttachMoneyIcon
                        key={i}
                        sx={{ fontSize: 12, color: "#F59E0B" }}
                      />
                    ))}
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Menu>
    </>
  );
};
```

### 3.2 Ajouter le système de notifications

```tsx
// Composant NotificationSystem
const NotificationSystem = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [hasNewNotifications, setHasNewNotifications] = useState(true);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
    setHasNewNotifications(false);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <IconButton onClick={handleClick} sx={{ position: "relative" }}>
        <NotificationsIcon />
        {hasNewNotifications && (
          <Box
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              width: 8,
              height: 8,
              borderRadius: "50%",
              bgcolor: "error.main",
              border: "1px solid",
              borderColor: "background.paper",
            }}
          />
        )}
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          sx: {
            bgcolor: "rgba(15, 23, 42, 0.95)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(71, 85, 105, 0.15)",
            borderRadius: 2,
            mt: 1.5,
            p: 0,
            minWidth: 320,
            maxWidth: 320,
          },
        }}
      >
        <Box sx={{ p: 2, borderBottom: "1px solid rgba(71, 85, 105, 0.15)" }}>
          <Typography variant="subtitle1">Notifications</Typography>
        </Box>

        <List sx={{ p: 0 }}>
          <ListItem
            sx={{
              px: 2,
              py: 1.5,
              borderBottom: "1px solid rgba(71, 85, 105, 0.1)",
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              <TokenIcon sx={{ color: "#F59E0B" }} />
            </ListItemIcon>
            <ListItemText
              primary="Déploiement réussi"
              secondary="Votre token a été déployé avec succès"
              primaryTypographyProps={{ variant: "body2", fontWeight: 500 }}
              secondaryTypographyProps={{
                variant: "caption",
                sx: { color: "rgba(255, 255, 255, 0.6)" },
              }}
            />
            <Typography
              variant="caption"
              sx={{ color: "rgba(255, 255, 255, 0.5)" }}
            >
              2m
            </Typography>
          </ListItem>

          <ListItem
            sx={{
              px: 2,
              py: 1.5,
              borderBottom: "1px solid rgba(71, 85, 105, 0.1)",
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              <SystemUpdateIcon sx={{ color: "#3498db" }} />
            </ListItemIcon>
            <ListItemText
              primary="Mise à jour système"
              secondary="Nouvelle version de la plateforme disponible"
              primaryTypographyProps={{ variant: "body2", fontWeight: 500 }}
              secondaryTypographyProps={{
                variant: "caption",
                sx: { color: "rgba(255, 255, 255, 0.6)" },
              }}
            />
            <Typography
              variant="caption"
              sx={{ color: "rgba(255, 255, 255, 0.5)" }}
            >
              1h
            </Typography>
          </ListItem>

          <ListItem sx={{ px: 2, py: 1.5 }}>
            <ListItemIcon sx={{ minWidth: 40 }}>
              <GroupIcon sx={{ color: "#9c27b0" }} />
            </ListItemIcon>
            <ListItemText
              primary="Nouvelle communauté"
              secondary="Rejoignez notre serveur Discord"
              primaryTypographyProps={{ variant: "body2", fontWeight: 500 }}
              secondaryTypographyProps={{
                variant: "caption",
                sx: { color: "rgba(255, 255, 255, 0.6)" },
              }}
            />
            <Typography
              variant="caption"
              sx={{ color: "rgba(255, 255, 255, 0.5)" }}
            >
              1j
            </Typography>
          </ListItem>
        </List>

        <Box
          sx={{
            p: 1.5,
            textAlign: "center",
            borderTop: "1px solid rgba(71, 85, 105, 0.15)",
          }}
        >
          <Button
            size="small"
            sx={{
              color: "#F59E0B",
              textTransform: "none",
              "&:hover": { bgcolor: "rgba(245, 158, 11, 0.1)" },
            }}
          >
            Voir toutes les notifications
          </Button>
        </Box>
      </Menu>
    </>
  );
};
```

## Phase 4 : Optimisations

### 4.1 Améliorer l'accessibilité

```tsx
// Ajouter des attributs ARIA
<NavButton
  component={RouterLink}
  to="/plans"
  aria-current={location.pathname === '/plans' ? 'page' : undefined}
>
  Plans & Tarifs
</NavButton>

// Pour les menus déroulants
<NavButton
  onClick={handleServicesMenuOpen}
  aria-haspopup="true"
  aria-expanded={Boolean(servicesMenuAnchor)}
>
  Services {servicesMenuAnchor ? <ExpandLess sx={{ ml: 0.5 }} /> : <ExpandMore sx={{ ml: 0.5 }} />}
</NavButton>

// Pour les éléments sans texte visible
<IconButton
  color="inherit"
  aria-label="search the site"
  edge="start"
>
  <SearchIcon />
</IconButton>
```

### 4.2 Optimiser les performances

```tsx
// Lazy loading des mega menus
const MegaMenuServices = lazy(() => import('./MegaMenuServices'));

// Dans le rendu
<Suspense fallback={<Box sx={{ p: 3, minHeight: 200, display: 'flex', alignItems: 'center', justifyContent:
```
