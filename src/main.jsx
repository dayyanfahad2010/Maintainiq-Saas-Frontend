import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "@/app/store";
import { Loader } from "@/components/common/Feedback";
import App from "./App.jsx";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <PersistGate loading={<Loader label="Starting MaintainIQ…" className="min-h-screen" />} persistor={persistor}>
        <App />
      </PersistGate>
    </Provider>
  </StrictMode>
);
