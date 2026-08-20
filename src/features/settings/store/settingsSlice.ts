import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { THEME_STORAGE_KEY } from '../../../config/constants';

export type ThemeMode = 'system' | 'light' | 'dark';

type SettingsState = {
  themeMode: ThemeMode;
  loaded: boolean;
};

const initialState: SettingsState = {
  themeMode: 'system',
  loaded: false,
};

export const loadTheme = createAsyncThunk('settings/loadTheme', async () => {
  const value = await AsyncStorage.getItem(THEME_STORAGE_KEY);
  return (value as ThemeMode) ?? 'system';
});

export const setTheme = createAsyncThunk(
  'settings/setTheme',
  async (mode: ThemeMode) => {
    await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
    return mode;
  },
);

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(loadTheme.fulfilled, (state, action) => {
        state.themeMode = action.payload;
        state.loaded = true;
      })
      .addCase(loadTheme.rejected, state => {
        state.loaded = true;
      })
      .addCase(setTheme.fulfilled, (state, action) => {
        state.themeMode = action.payload;
      });
  },
});

export default settingsSlice.reducer;
