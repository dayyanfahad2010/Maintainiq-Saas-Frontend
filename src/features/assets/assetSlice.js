import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  createAssetAPI,
  deleteAssetAPI,
  getAssetByIdAPI,
  getAssetsAPI,
  updateAssetAPI,
} from "./assetAPI";

export const fetchAssets = createAsyncThunk(
  "assets/fetchAssets",
  async (params, { rejectWithValue }) => {
    try {
      const res = await getAssetsAPI(params);
      return { list: res.data, count: res.extras?.count ?? res.data.length };
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchAssetById = createAsyncThunk(
  "assets/fetchAssetById",
  async (id, { rejectWithValue }) => {
    try {
      const res = await getAssetByIdAPI(id);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const createAsset = createAsyncThunk(
  "assets/createAsset",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await createAssetAPI(payload);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const updateAsset = createAsyncThunk(
  "assets/updateAsset",
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      const res = await updateAssetAPI({ id, payload });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const deleteAsset = createAsyncThunk(
  "assets/deleteAsset",
  async (id, { rejectWithValue }) => {
    try {
      await deleteAssetAPI(id);
      return id;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const initialState = {
  list: [],
  count: 0,
  current: null,
  status: "idle",
  actionStatus: "idle",
  error: null,
};

const assetSlice = createSlice({
  name: "assets",
  initialState,
  reducers: {
    clearCurrentAsset(state) {
      state.current = null;
    },
    clearAssetError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAssets.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchAssets.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.list = action.payload.list;
        state.count = action.payload.count;
      })
      .addCase(fetchAssets.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      .addCase(fetchAssetById.pending, (state) => {
        state.status = "loading";
        state.current = null;
        state.error = null;
      })
      .addCase(fetchAssetById.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.current = action.payload;
      })
      .addCase(fetchAssetById.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      .addCase(createAsset.pending, (state) => {
        state.actionStatus = "loading";
        state.error = null;
      })
      .addCase(createAsset.fulfilled, (state, action) => {
        state.actionStatus = "succeeded";
        state.list.unshift(action.payload);
      })
      .addCase(createAsset.rejected, (state, action) => {
        state.actionStatus = "failed";
        state.error = action.payload;
      })

      .addCase(updateAsset.pending, (state) => {
        state.actionStatus = "loading";
        state.error = null;
      })
      .addCase(updateAsset.fulfilled, (state, action) => {
        state.actionStatus = "succeeded";
        if (action.payload?._id) {
          state.current = action.payload;
          state.list = state.list.map((a) =>
            a._id === action.payload._id ? action.payload : a
          );
        }
      })
      .addCase(updateAsset.rejected, (state, action) => {
        state.actionStatus = "failed";
        state.error = action.payload;
      })

      .addCase(deleteAsset.fulfilled, (state, action) => {
        state.list = state.list.map((a) =>
          a._id === action.payload ? { ...a, status: "Retired" } : a
        );
      });
  },
});

export const { clearCurrentAsset, clearAssetError } = assetSlice.actions;
export default assetSlice.reducer;
