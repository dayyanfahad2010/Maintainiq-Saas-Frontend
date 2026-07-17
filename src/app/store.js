import { combineReducers, configureStore } from "@reduxjs/toolkit";
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import storage from "./localStorageEngine";

import authReducer from "@/features/auth/authSlice";
import assetReducer from "@/features/assets/assetSlice";
import issueReducer from "@/features/issues/issueSlice";
import maintenanceReducer from "@/features/maintenance/maintenanceSlice";
import dashboardReducer from "@/features/dashboard/dashboardSlice";
import historyReducer from "@/features/history/historySlice";
import aiReducer from "@/features/ai/aiSlice";
import publicReducer from "@/features/public/publicSlice";
import userReducer from "@/features/users/userSlice";
import uiReducer from "@/features/ui/uiSlice";
import notificationsReducer from "@/features/notifications/notificationSlice";
import organizationsReducer from "@/features/organizations/organizationSlice";

const rootReducer = combineReducers({
  auth: authReducer,
  assets: assetReducer,
  issues: issueReducer,
  maintenance: maintenanceReducer,
  dashboard: dashboardReducer,
  history: historyReducer,
  ai: aiReducer,
  public: publicReducer,
  users: userReducer,
  ui: uiReducer,
  notifications: notificationsReducer,
  organizations: organizationsReducer,
});

// Only persist auth (lightweight session hint) and ui (theme preference).
// Everything else is re-fetched from the API so data never goes stale in storage.
const persistConfig = {
  key: "maintainiq",
  version: 1,
  storage,
  whitelist: ["auth", "ui"],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);
