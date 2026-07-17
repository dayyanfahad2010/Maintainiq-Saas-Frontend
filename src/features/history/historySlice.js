import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosClient from "@/api/axiosClient";

export const fetchAssetHistory = createAsyncThunk(
  "history/fetchAssetHistory",
  async (assetId, { rejectWithValue }) => {
    try {
      const res = await axiosClient.get(`/history/${assetId}`);
      const raw = res.data.data;
      // Backend spreads the history array into an object ({ "0": {...}, "1": {...} }).
      // Normalize back into an array so the UI doesn't need to know about that quirk.
      const list = Array.isArray(raw) ? raw : Object.values(raw || {}).filter(
        (v) => v && typeof v === "object" && v._id
      );
      return list;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const initialState = {
  list: [],
  status: "idle",
  error: null,
};

const historySlice = createSlice({
  name: "history",
  initialState,
  reducers: {
    clearHistory(state) {
      state.list = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAssetHistory.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchAssetHistory.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.list = action.payload;
      })
      .addCase(fetchAssetHistory.rejected, (state, action) => {
        state.status = "failed";
        state.list = [];
        state.error = action.payload;
      });
  },
});

export const { clearHistory } = historySlice.actions;
export default historySlice.reducer;
