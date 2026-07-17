import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosClient from "@/api/axiosClient";

export const fetchPublicAsset = createAsyncThunk(
  "public/fetchPublicAsset",
  async (assetCode, { rejectWithValue }) => {
    try {
      const res = await axiosClient.get(`/public/assets/${assetCode}`);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const reportPublicIssue = createAsyncThunk(
  "public/reportPublicIssue",
  async ({ assetCode, payload, files }, { rejectWithValue }) => {
    try {
      let body = payload;
      let config = {};

      if (files?.length) {
        const formData = new FormData();
        Object.entries(payload).forEach(([key, value]) => {
          if (value === undefined || value === null) return;
          formData.append(key, typeof value === "object" ? JSON.stringify(value) : value);
        });
        files.forEach((file) => formData.append("evidence", file));
        body = formData;
        // Let the browser set the multipart boundary itself.
        config = { headers: { "Content-Type": undefined } };
      }

      const res = await axiosClient.post(
        `/public/assets/${assetCode}/report`,
        body,
        config
      );
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const initialState = {
  asset: null,
  status: "idle",
  error: null,
  reportStatus: "idle",
  reportError: null,
  reportSuccess: false,
  lastIssueNumber: null,
};

const publicSlice = createSlice({
  name: "public",
  initialState,
  reducers: {
    resetReportState(state) {
      state.reportStatus = "idle";
      state.reportError = null;
      state.reportSuccess = false;
      state.lastIssueNumber = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPublicAsset.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchPublicAsset.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.asset = action.payload;
      })
      .addCase(fetchPublicAsset.rejected, (state, action) => {
        state.status = "failed";
        state.asset = null;
        state.error = action.payload;
      })

      .addCase(reportPublicIssue.pending, (state) => {
        state.reportStatus = "loading";
        state.reportError = null;
      })
      .addCase(reportPublicIssue.fulfilled, (state, action) => {
        state.reportStatus = "succeeded";
        state.reportSuccess = true;
        state.lastIssueNumber = action.payload?.data?.issue?.issueNumber || null;
      })
      .addCase(reportPublicIssue.rejected, (state, action) => {
        state.reportStatus = "failed";
        state.reportError = action.payload;
      });
  },
});

export const { resetReportState } = publicSlice.actions;
export default publicSlice.reducer;
