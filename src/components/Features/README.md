# Feature Components

This directory contains feature-specific components organized by domain.

## Structure

- `token/` - Token creation and management
- `launchpad/` - Launchpad feature components
- `staking/` - Staking feature components

## Organization

Each feature folder should follow this structure:
```
feature/
├── components/    # Feature-specific components
├── hooks/         # Custom hooks
├── types/         # TypeScript types
├── utils/         # Utility functions
├── constants/     # Constants and configurations
└── tests/         # Test files
```

## Guidelines

1. Keep features isolated and independent
2. Use shared components from core/ when possible
3. Document feature-specific requirements
4. Include integration tests
