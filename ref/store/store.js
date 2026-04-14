
import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import { encryptTransform } from "redux-persist-transform-encrypt";
import authReducer from "./auth/authSlice";
import versionReducer from "./auth/versionSlice";
import companyReducer from "./auth/companySlice";
import uiReducer from "./ui/uiSlice";

const secretKey = import.meta.env.VITE_SECRET_KEY;

let transforms = [];

if (!secretKey) {
  console.warn(
    "❌ Missing SECRET_KEY — AppInitializer will handle redirection."
  );
} else {
  transforms.push(
    encryptTransform({
      secretKey,
      onError: (error) => console.error("Encryption Error:", error),
    })
  );
}

const persistConfig = {
  key: "root-aia",
  storage,
  whitelist: ["auth", "company", "version", "ui"],
  transforms,
};

const rootReducer = combineReducers({
  auth: authReducer,
  version: versionReducer,
  company: companyReducer,
  ui: uiReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          "persist/PERSIST",
          "persist/REHYDRATE",
          "persist/PAUSE",
          "persist/FLUSH",
          "persist/PURGE",
          "persist/REGISTER",
        ],
      },
    }),
});

export const persistor = persistStore(store);
