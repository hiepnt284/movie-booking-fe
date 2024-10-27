// src/store/modalSlice.js
import { createSlice } from "@reduxjs/toolkit";
import { MODAL_TYPES } from "../modalTypes";

const initialState = {
  isOpen: false,
  modalType: null, // Sử dụng modalType thay vì componentName
  modalProps: {}, // Sử dụng modalProps thay vì componentProps
};

const modalSlice = createSlice({
  name: "modal",
  initialState,
  reducers: {
    openModal: (state, action) => {
      const { modalType, modalProps } = action.payload;
      state.isOpen = true;
      state.modalType = modalType;
      state.modalProps = modalProps || {};
    },
    closeModal: (state) => {
      state.isOpen = false;
      state.modalType = null;
      state.modalProps = {};
    },
  },
});

export const { openModal, closeModal } = modalSlice.actions;

export default modalSlice.reducer;
