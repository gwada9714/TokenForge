# Code Citations

## useAuth Hook
Source: https://github.com/Alejoboga20/ts-heroes-app/blob/e3fdd3d8f7a8f790c232ff8f0ff6e65737796a7b/src/auth/hooks/useAuth.ts
License: Unknown

```typescript
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
```

