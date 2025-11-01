import { createSlice } from "@reduxjs/toolkit";

// Retrieve user data from localStorage
const storedUser = localStorage.getItem("user");

// Parse user data if it exists and is valid JSON, otherwise default to null
const initialState = {
  userValue:
    storedUser && isValidJSON(storedUser) ? JSON.parse(storedUser) : null,
};

// Check if a string is valid JSON
function isValidJSON(str) {
  try {
    JSON.parse(str);
    return true;
  } catch (e) {
    return false;
  }
}

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    activeUser: (state, action) => {
      state.userValue = action.payload;
    },
  },
});

export const { activeUser } = userSlice.actions;

export default userSlice.reducer;
