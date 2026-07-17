import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosClient from "@/api/axiosClient";

export const fetchTechnicians = createAsyncThunk(
  "users/fetchTechnicians",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosClient.get("/users", { params: { role: "technician" } });
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const initialState = {
  technicians: [],
  status: "idle",
  error: null,
};

const userSlice = createSlice({
  name: "users",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTechnicians.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchTechnicians.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.technicians = action.payload;
      })
      .addCase(fetchTechnicians.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export default userSlice.reducer;
