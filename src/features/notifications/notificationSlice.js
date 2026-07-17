import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  getNotificationsAPI,
  getUnreadCountAPI,
  markAllNotificationsReadAPI,
  markNotificationReadAPI,
} from "./notificationAPI";

export const fetchNotifications = createAsyncThunk(
  "notifications/fetchNotifications",
  async (_, { rejectWithValue }) => {
    try {
      const res = await getNotificationsAPI();
      return { list: res.data, unreadCount: res.extras?.unreadCount ?? 0 };
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchUnreadCount = createAsyncThunk(
  "notifications/fetchUnreadCount",
  async (_, { rejectWithValue }) => {
    try {
      const res = await getUnreadCountAPI();
      return res.data.unreadCount;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const markNotificationRead = createAsyncThunk(
  "notifications/markNotificationRead",
  async (id, { rejectWithValue }) => {
    try {
      const res = await markNotificationReadAPI(id);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const markAllNotificationsRead = createAsyncThunk(
  "notifications/markAllNotificationsRead",
  async (_, { rejectWithValue }) => {
    try {
      await markAllNotificationsReadAPI();
      return true;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const initialState = {
  list: [],
  unreadCount: 0,
  status: "idle", // idle | loading | succeeded | failed
};

const notificationSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    // Called by RealtimeSync when a "notification:new" socket event arrives.
    notificationReceived(state, action) {
      state.list.unshift(action.payload);
      state.unreadCount += 1;
    },
    resetNotifications() {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.list = action.payload.list;
        state.unreadCount = action.payload.unreadCount;
      })
      .addCase(fetchNotifications.rejected, (state) => {
        state.status = "failed";
      })

      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload;
      })

      .addCase(markNotificationRead.fulfilled, (state, action) => {
        const notif = state.list.find((n) => n._id === action.payload._id);
        if (notif && !notif.isRead) {
          notif.isRead = true;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })

      .addCase(markAllNotificationsRead.fulfilled, (state) => {
        state.list.forEach((n) => {
          n.isRead = true;
        });
        state.unreadCount = 0;
      });
  },
});

export const { notificationReceived, resetNotifications } = notificationSlice.actions;
export default notificationSlice.reducer;
