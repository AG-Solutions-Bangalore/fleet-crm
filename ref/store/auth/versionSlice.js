import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  showUpdateDialog: false,
  version: null,
};

const versionSlice = createSlice({
  name: "version",
  initialState,
  reducers: {
    setShowUpdateDialog: (state, action) => {
      state.showUpdateDialog = action.payload.showUpdateDialog;
      state.version = action.payload.version;
    },
  },
});

export const { setShowUpdateDialog } = versionSlice.actions;
export default versionSlice.reducer;
