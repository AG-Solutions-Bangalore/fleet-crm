import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  companyDetails: null,
  companyImage: null,
};

const companySlice = createSlice({
  name: "company",
  initialState,
  reducers: {
    setCompanyDetails: (state, action) => {
      state.companyDetails = action.payload;
    },
    setCompanyImage: (state, action) => {
      state.companyImage = action.payload;
    },
    resetCompany: () => initialState,
  },
});

export const { setCompanyDetails, setCompanyImage, resetCompany } =
  companySlice.actions;

export default companySlice.reducer;
