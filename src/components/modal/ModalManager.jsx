// src/components/ModalManager.js
import React from "react";
import { Modal } from "antd";
import { useSelector, useDispatch } from "react-redux";
import { closeModal } from "../../store/slices/modalSlice";
import { MODAL_TYPES } from "../../store/modalTypes";
import RegisterMultiStepForm from "./RegisterMultiStepForm";
import LoginForm from "./LoginForm";
import ForgotPasswordForm from "./ForgotPasswordForm";
// Import các component modal khác nếu cần

const MODAL_COMPONENTS = {
  [MODAL_TYPES.REGISTER_MULTI_STEP]: RegisterMultiStepForm,
  [MODAL_TYPES.LOGIN]: LoginForm,
  [MODAL_TYPES.FORGOT_PASSWORD]: ForgotPasswordForm,
};

const ModalManager = () => {
  const dispatch = useDispatch();
  const { isOpen, modalType, modalProps } = useSelector((state) => state.modal);

  if (!isOpen || !modalType) return null;

  const SpecificModal = MODAL_COMPONENTS[modalType];

  if (!SpecificModal) return null;

  const { top, width } = modalProps;
  return (
    <Modal
      open={isOpen}
      onCancel={() => dispatch(closeModal())}
      footer={null}
      destroyOnClose
      style={{
        top: top,
      }}
      width={width}
      // Bạn có thể thêm các thuộc tính khác như width, centered, etc.
    >
      <SpecificModal {...modalProps} />
    </Modal>
  );
};

export default ModalManager;
