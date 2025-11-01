import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./Slices/userSlices";

export const store = configureStore({
  reducer: {
    users: userReducer,
  },
});
