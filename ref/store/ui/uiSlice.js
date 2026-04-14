import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  sidebarOpen: true,
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    toggleSidebar(state) {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebar(state, action) {
      state.sidebarOpen = action.payload;
    },
    resetUI() {
      return initialState;
    },
  },
});

export const { toggleSidebar, setSidebar, resetUI } = uiSlice.actions;
export default uiSlice.reducer;
