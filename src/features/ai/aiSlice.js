import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosClient from "@/api/axiosClient";

export const runIssueTriage = createAsyncThunk(
  "ai/runIssueTriage",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await axiosClient.post("/ai/triage", payload);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const runMaintenanceSummary = createAsyncThunk(
  "ai/runMaintenanceSummary",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await axiosClient.post("/ai/maintenance-summary", payload);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const runAssetHealthAnalysis = createAsyncThunk(
  "ai/runAssetHealthAnalysis",
  async (assetId, { rejectWithValue }) => {
    try {
      const res = await axiosClient.get(`/ai/asset-health/${assetId}`);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// Not a thunk — chat conversation state lives locally in AssetChatWidget,
// so this is just a plain API call the widget invokes per message.
export const sendAssetChatMessage = (assetId, message, history) =>
  axiosClient
    .post(`/ai/asset-chat/${assetId}`, { message, history })
    .then((res) => res.data.data.reply);

const initialState = {
  triage: null,
  triageStatus: "idle", // idle | loading | succeeded | failed
  triageError: null,
  summary: null,
  summaryStatus: "idle",
  summaryError: null,
  health: null,
  healthStatus: "idle",
  healthError: null,
};

const aiSlice = createSlice({
  name: "ai",
  initialState,
  reducers: {
    clearTriage(state) {
      state.triage = null;
      state.triageStatus = "idle";
      state.triageError = null;
    },
    clearSummary(state) {
      state.summary = null;
      state.summaryStatus = "idle";
      state.summaryError = null;
    },
    clearHealth(state) {
      state.health = null;
      state.healthStatus = "idle";
      state.healthError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(runIssueTriage.pending, (state) => {
        state.triageStatus = "loading";
        state.triageError = null;
      })
      .addCase(runIssueTriage.fulfilled, (state, action) => {
        state.triageStatus = "succeeded";
        state.triage = action.payload;
      })
      .addCase(runIssueTriage.rejected, (state, action) => {
        state.triageStatus = "failed";
        state.triageError = action.payload;
      })

      .addCase(runMaintenanceSummary.pending, (state) => {
        state.summaryStatus = "loading";
        state.summaryError = null;
      })
      .addCase(runMaintenanceSummary.fulfilled, (state, action) => {
        state.summaryStatus = "succeeded";
        state.summary = action.payload.summary;
      })
      .addCase(runMaintenanceSummary.rejected, (state, action) => {
        state.summaryStatus = "failed";
        state.summaryError = action.payload;
      })

      .addCase(runAssetHealthAnalysis.pending, (state) => {
        state.healthStatus = "loading";
        state.healthError = null;
      })
      .addCase(runAssetHealthAnalysis.fulfilled, (state, action) => {
        state.healthStatus = "succeeded";
        state.health = action.payload;
      })
      .addCase(runAssetHealthAnalysis.rejected, (state, action) => {
        state.healthStatus = "failed";
        state.healthError = action.payload;
      });
  },
});

export const { clearTriage, clearSummary, clearHealth } = aiSlice.actions;
export default aiSlice.reducer;
