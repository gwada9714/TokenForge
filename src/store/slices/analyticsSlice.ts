import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface AnalyticsState {
  events: Array<{
    id: string;
    type: string;
    timestamp: number;
    data: any;
  }>;
  tokens: Record<string, TokenAnalytics>;
  loading: boolean;
  error: string | null;
  selectedToken: string | null;
  realtimeSubscriptions: Record<string, boolean>;
}

interface TokenAnalytics {
  token: {
    address: string;
  };
  events: TokenEvent[];
}

interface TokenEvent {
  id: string;
  type: string;
  timestamp: number;
  data: any;
}

const initialState: AnalyticsState = {
  events: [],
  tokens: {},
  loading: false,
  error: null,
  selectedToken: null,
  realtimeSubscriptions: {}
};

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setSelectedToken: (state, action: PayloadAction<string | null>) => {
      state.selectedToken = action.payload;
    },
    updateTokenAnalytics: (state, action: PayloadAction<TokenAnalytics>) => {
      const { address } = action.payload.token;
      state.tokens[address] = action.payload;
    },
    addTokenEvent: (state, action: PayloadAction<{ address: string; event: TokenEvent }>) => {
      const { address, event } = action.payload;
      if (state.tokens[address]) {
        state.tokens[address].events.unshift(event);
        // Garder seulement les 1000 derniers événements
        if (state.tokens[address].events.length > 1000) {
          state.tokens[address].events.pop();
        }
      }
    },
    setRealtimeSubscription: (state, action: PayloadAction<{ address: string; active: boolean }>) => {
      const { address, active } = action.payload;
      state.realtimeSubscriptions[address] = active;
    },
    clearTokenData: (state, action: PayloadAction<string>) => {
      const address = action.payload;
      delete state.tokens[address];
      delete state.realtimeSubscriptions[address];
      if (state.selectedToken === address) {
        state.selectedToken = null;
      }
    },
    addEvent: (state, action: PayloadAction<{ type: string; data: any }>) => {
      state.events.push({
        id: Date.now().toString(),
        timestamp: Date.now(),
        ...action.payload,
      });
    },
    clearEvents: (state) => {
      state.events = [];
    },
  }
});

export const {
  setLoading,
  setError,
  setSelectedToken,
  updateTokenAnalytics,
  addTokenEvent,
  setRealtimeSubscription,
  clearTokenData,
  addEvent,
  clearEvents
} = analyticsSlice.actions;

export default analyticsSlice.reducer;
