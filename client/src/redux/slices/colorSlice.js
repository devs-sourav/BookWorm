// redux/colorSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  selectedColor: '', // or a default color if needed
};

const colorSlice = createSlice({
  name: 'color',
  initialState,
  reducers: {
    setColor: (state, action) => {
      state.selectedColor = action.payload;
    },
    resetColor: (state) => {
      state.selectedColor = null;
    },
  },
});

export const { setColor, resetColor } = colorSlice.actions;

export default colorSlice.reducer;
