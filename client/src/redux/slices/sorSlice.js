import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  selectedSortOption: 'default',
};

const sortSlice = createSlice({
  name: 'sort',
  initialState,
  reducers: {
    setSortOption: (state, action) => {
      state.selectedSortOption = action.payload;
    },
  },
});

export const { setSortOption } = sortSlice.actions;
export default sortSlice.reducer;