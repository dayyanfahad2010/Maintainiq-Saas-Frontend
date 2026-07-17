import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  assignTechnicianAPI,
  getIssueByIdAPI,
  getIssuesAPI,
  getMyAssignedIssuesAPI,
  updateIssueStatusAPI,
} from "./issueAPI";

export const fetchIssues = createAsyncThunk(
  "issues/fetchIssues",
  async (params, { rejectWithValue }) => {
    try {
      const res = await getIssuesAPI(params);
      return { list: res.data, count: res.extras?.count ?? res.data.length };
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchMyIssues = createAsyncThunk(
  "issues/fetchMyIssues",
  async (_, { rejectWithValue }) => {
    try {
      const res = await getMyAssignedIssuesAPI();
      return { list: res.data, count: res.extras?.count ?? res.data.length };
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchIssueById = createAsyncThunk(
  "issues/fetchIssueById",
  async (id, { rejectWithValue }) => {
    try {
      const res = await getIssueByIdAPI(id);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const assignTechnician = createAsyncThunk(
  "issues/assignTechnician",
  async ({ id, assignedTechnician }, { rejectWithValue }) => {
    try {
      const res = await assignTechnicianAPI({ id, assignedTechnician });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const updateIssueStatus = createAsyncThunk(
  "issues/updateIssueStatus",
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const res = await updateIssueStatusAPI({ id, status });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const initialState = {
  list: [],
  myList: [],
  count: 0,
  current: null,
  status: "idle",
  actionStatus: "idle",
  error: null,
};

const issueSlice = createSlice({
  name: "issues",
  initialState,
  reducers: {
    clearCurrentIssue(state) {
      state.current = null;
    },
    clearIssueError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchIssues.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchIssues.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.list = action.payload.list;
        state.count = action.payload.count;
      })
      .addCase(fetchIssues.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      .addCase(fetchMyIssues.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchMyIssues.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.myList = action.payload.list;
      })
      .addCase(fetchMyIssues.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      .addCase(fetchIssueById.pending, (state) => {
        state.status = "loading";
        state.current = null;
        state.error = null;
      })
      .addCase(fetchIssueById.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.current = action.payload;
      })
      .addCase(fetchIssueById.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      .addCase(assignTechnician.pending, (state) => {
        state.actionStatus = "loading";
      })
      .addCase(assignTechnician.fulfilled, (state, action) => {
        state.actionStatus = "succeeded";
        state.current = action.payload;
      })
      .addCase(assignTechnician.rejected, (state, action) => {
        state.actionStatus = "failed";
        state.error = action.payload;
      })

      .addCase(updateIssueStatus.pending, (state) => {
        state.actionStatus = "loading";
      })
      .addCase(updateIssueStatus.fulfilled, (state, action) => {
        state.actionStatus = "succeeded";
        state.current = action.payload;
      })
      .addCase(updateIssueStatus.rejected, (state, action) => {
        state.actionStatus = "failed";
        state.error = action.payload;
      });
  },
});

export const { clearCurrentIssue, clearIssueError } = issueSlice.actions;
export default issueSlice.reducer;
