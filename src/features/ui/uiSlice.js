import { createSlice } from "@reduxjs/toolkit";

const prefersDark =
  typeof window !== "undefined" &&
  window.matchMedia &&
  window.matchMedia("(prefers-color-scheme: dark)").matches;

const initialState = {
  theme: prefersDark ? "dark" : "light", // overridden by redux-persist if a value was saved
  sidebarOpen: false, // mobile sidebar drawer
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setTheme(state, action) {
      state.theme = action.payload;
    },
    toggleTheme(state) {
      state.theme = state.theme === "dark" ? "light" : "dark";
    },
    toggleSidebar(state) {
      state.sidebarOpen = !state.sidebarOpen;
    },
    closeSidebar(state) {
      state.sidebarOpen = false;
    },
  },
});

export const { setTheme, toggleTheme, toggleSidebar, closeSidebar } = uiSlice.actions;
export default uiSlice.reducer;
