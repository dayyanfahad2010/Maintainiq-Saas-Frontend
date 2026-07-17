import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  activateOrganizationAPI,
  createOrganizationAPI,
  deleteOrganizationAPI,
  getOrganizationsAPI,
  suspendOrganizationAPI,
} from "./organizationAPI";

export const fetchOrganizations = createAsyncThunk(
  "organizations/fetchOrganizations",
  async (_, { rejectWithValue }) => {
    try {
      const res = await getOrganizationsAPI();
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const createOrganization = createAsyncThunk(
  "organizations/createOrganization",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await createOrganizationAPI(payload);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const suspendOrganization = createAsyncThunk(
  "organizations/suspendOrganization",
  async (id, { rejectWithValue }) => {
    try {
      const res = await suspendOrganizationAPI(id);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const activateOrganization = createAsyncThunk(
  "organizations/activateOrganization",
  async (id, { rejectWithValue }) => {
    try {
      const res = await activateOrganizationAPI(id);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const deleteOrganization = createAsyncThunk(
  "organizations/deleteOrganization",
  async (id, { rejectWithValue }) => {
    try {
      await deleteOrganizationAPI(id);
      return id;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const initialState = {
  list: [],
  status: "idle", // idle | loading | succeeded | failed
  error: null,
};

const organizationSlice = createSlice({
  name: "organizations",
  initialState,
  reducers: {
    // Called by the super-admin dashboard when a platform-wide socket
    // event (organization:created/updated/deleted) arrives.
    organizationUpserted(state, action) {
      const idx = state.list.findIndex((o) => o._id === action.payload._id);
      if (idx >= 0) state.list[idx] = { ...state.list[idx], ...action.payload };
      else state.list.unshift(action.payload);
    },
    organizationRemoved(state, action) {
      state.list = state.list.filter((o) => o._id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrganizations.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchOrganizations.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.list = action.payload;
      })
      .addCase(fetchOrganizations.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      .addCase(createOrganization.fulfilled, (state, action) => {
        state.list.unshift({ ...action.payload, userCount: 0, assetCount: 0, issueCount: 0 });
      })

      .addCase(suspendOrganization.fulfilled, (state, action) => {
        const org = state.list.find((o) => o._id === action.payload._id);
        if (org) org.status = action.payload.status;
      })
      .addCase(activateOrganization.fulfilled, (state, action) => {
        const org = state.list.find((o) => o._id === action.payload._id);
        if (org) org.status = action.payload.status;
      })

      .addCase(deleteOrganization.fulfilled, (state, action) => {
        state.list = state.list.filter((o) => o._id !== action.payload);
      });
  },
});

export const { organizationUpserted, organizationRemoved } = organizationSlice.actions;
export default organizationSlice.reducer;
