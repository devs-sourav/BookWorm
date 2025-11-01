import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  minPrice: 0,
  maxPrice: 10000,
};

const priceRangeSlice = createSlice({
  name: 'priceRange',
  initialState,
  reducers: {
    setPriceRange: (state, action) => {
      state.minPrice = action.payload[0];
      state.maxPrice = action.payload[1];
    },
  },
});

export const { setPriceRange } = priceRangeSlice.actions;
export default priceRangeSlice.reducer;
