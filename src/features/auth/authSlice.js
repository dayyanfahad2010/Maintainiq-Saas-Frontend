import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  forgotPasswordAPI,
  loginAPI,
  logoutAPI,
  profileAPI,
  resetPasswordAPI,
  signUpAPI,
} from "./authAPI";

export const login = createAsyncThunk("auth/login", async (payload, { rejectWithValue }) => {
  try {
    const res = await loginAPI(payload);
    if (!res?.data?._id) {
      // Backend responded 200 but without a real user object — treat it as
      // a failure rather than silently logging in with no user data.
      return rejectWithValue("Login response was missing user data. Please try again.");
    }
    return res.data;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const signUp = createAsyncThunk("auth/signUp", async (payload, { rejectWithValue }) => {
  try {
    const res = await signUpAPI(payload);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const logout = createAsyncThunk("auth/logout", async (_, { rejectWithValue }) => {
  try {
    await logoutAPI();
    return true;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const fetchProfile = createAsyncThunk("auth/fetchProfile", async (_, { rejectWithValue }) => {
  try {
    const res = await profileAPI();
    if (!res?.data?._id) {
      return rejectWithValue("No active session.");
    }
    return res.data;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const forgotPassword = createAsyncThunk(
  "auth/forgotPassword",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await forgotPasswordAPI(payload);
      return res.message;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await resetPasswordAPI(payload);
      return res.message;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const initialState = {
  user: null,
  isAuthenticated: false,
  authChecked: false, // becomes true once we've verified session on load
  status: "idle", // idle | loading | succeeded | failed
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearAuthError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload;
        state.isAuthenticated = true;
        state.authChecked = true;
      })
      .addCase(login.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
        state.isAuthenticated = false;
      })

      .addCase(signUp.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(signUp.fulfilled, (state) => {
        state.status = "succeeded";
      })
      .addCase(signUp.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      .addCase(fetchProfile.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload;
        state.isAuthenticated = true;
        state.authChecked = true;
      })
      .addCase(fetchProfile.rejected, (state) => {
        state.status = "idle";
        state.user = null;
        state.isAuthenticated = false;
        state.authChecked = true;
      })

      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.status = "idle";
      })

      .addCase(forgotPassword.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        state.status = "succeeded";
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      .addCase(resetPassword.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.status = "succeeded";
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export const { clearAuthError } = authSlice.actions;
export default authSlice.reducer;
