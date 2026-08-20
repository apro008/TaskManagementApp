import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from '@reduxjs/toolkit';
import {
  authErrorMessage,
  logOut,
  signIn,
  signUp,
  type AuthUser,
} from '../services/authService';

type AuthState = {
  user: AuthUser | null;
  ready: boolean;
  busy: boolean;
  error: string | null;
};

const initialState: AuthState = {
  user: null,
  ready: false,
  busy: false,
  error: null,
};

export const login = createAsyncThunk(
  'auth/login',
  async (input: { email: string; password: string }, { rejectWithValue }) => {
    try {
      return await signIn(input.email.trim(), input.password);
    } catch (error) {
      return rejectWithValue(authErrorMessage(error));
    }
  },
);

export const register = createAsyncThunk(
  'auth/register',
  async (
    input: { email: string; password: string; name: string },
    { rejectWithValue },
  ) => {
    try {
      return await signUp(
        input.email.trim(),
        input.password,
        input.name.trim(),
      );
    } catch (error) {
      return rejectWithValue(authErrorMessage(error));
    }
  },
);

export const logout = createAsyncThunk('auth/logout', async () => {
  await logOut();
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    userChanged(state, action: PayloadAction<AuthUser | null>) {
      state.user = action.payload;
      state.ready = true;
    },
    errorCleared(state) {
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(login.pending, state => {
        state.busy = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.busy = false;
        state.user = action.payload;
      })
      .addCase(login.rejected, (state, action) => {
        state.busy = false;
        state.error = String(action.payload ?? 'Login failed');
      })
      .addCase(register.pending, state => {
        state.busy = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.busy = false;
        state.user = action.payload;
      })
      .addCase(register.rejected, (state, action) => {
        state.busy = false;
        state.error = String(action.payload ?? 'Sign up failed');
      })
      .addCase(logout.fulfilled, state => {
        state.user = null;
        state.error = null;
      });
  },
});

export const { userChanged, errorCleared } = authSlice.actions;
export default authSlice.reducer;
