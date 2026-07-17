import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  createMaintenanceAPI,
  getMaintenanceByIssueAPI,
  updateMaintenanceAPI,
} from "./maintenanceAPI";

export const createMaintenance = createAsyncThunk(
  "maintenance/createMaintenance",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await createMaintenanceAPI(payload);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchMaintenanceByIssue = createAsyncThunk(
  "maintenance/fetchMaintenanceByIssue",
  async (issueId, { rejectWithValue }) => {
    try {
      const res = await getMaintenanceByIssueAPI(issueId);
      return res.data;
    } catch (err) {
      // 404 means no record yet - not a real error for the UI
      return rejectWithValue(err.message);
    }
  }
);

export const updateMaintenance = createAsyncThunk(
  "maintenance/updateMaintenance",
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      const res = await updateMaintenanceAPI({ id, payload });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const initialState = {
  current: null,
  status: "idle",
  actionStatus: "idle",
  error: null,
};

const maintenanceSlice = createSlice({
  name: "maintenance",
  initialState,
  reducers: {
    clearCurrentMaintenance(state) {
      state.current = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createMaintenance.pending, (state) => {
        state.actionStatus = "loading";
        state.error = null;
      })
      .addCase(createMaintenance.fulfilled, (state, action) => {
        state.actionStatus = "succeeded";
        state.current = action.payload;
      })
      .addCase(createMaintenance.rejected, (state, action) => {
        state.actionStatus = "failed";
        state.error = action.payload;
      })

      .addCase(fetchMaintenanceByIssue.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchMaintenanceByIssue.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.current = action.payload;
      })
      .addCase(fetchMaintenanceByIssue.rejected, (state) => {
        state.status = "failed";
        state.current = null;
      })

      .addCase(updateMaintenance.pending, (state) => {
        state.actionStatus = "loading";
        state.error = null;
      })
      .addCase(updateMaintenance.fulfilled, (state, action) => {
        state.actionStatus = "succeeded";
        state.current = action.payload;
      })
      .addCase(updateMaintenance.rejected, (state, action) => {
        state.actionStatus = "failed";
        state.error = action.payload;
      });
  },
});

export const { clearCurrentMaintenance } = maintenanceSlice.actions;
export default maintenanceSlice.reducer;
