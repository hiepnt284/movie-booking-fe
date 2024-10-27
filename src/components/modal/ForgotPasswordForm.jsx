import React, { useState, useEffect } from "react";
import {
  Form,
  Input,
  Button,
  Typography,
  Alert,
  Select,
  DatePicker,
  message,
  Result,
} from "antd";
import { useDispatch } from "react-redux";
import authApi from "../../api/authApi";

import moment from "moment";
import Paragraph from "antd/es/typography/Paragraph";
import { MODAL_TYPES } from "../../store/modalTypes";
import { openModal } from "../../store/slices/modalSlice";

const { Text, Title } = Typography;


const ForgotPasswordForm = () => {
  const dispatch = useDispatch();
  const [step, setStep] = useState("forgot"); // 'forgot', 'recover', 'success'
  const [forgotForm] = Form.useForm();
  const [recoverForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [timer, setTimer] = useState(10); // 5 phút = 300 giây

  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  const handleOpenLogin = () => {
    dispatch(openModal({ modalType: MODAL_TYPES.LOGIN }));
  };

  const handleBackForgot = () => {
    setStep("forgot");
    };
    


  const handleForgot = async (values) => {
    setLoading(true);
    try {
      const payload = {
        email: values.email,
      };

      if (email != values.email) {
        setTimer(10);
        setEmail(values.email);
        const response = await authApi.forgotPassword(payload);
      }

      setStep("recover");
    } catch (err) {
      message.error(err.response?.data?.message || "Có lỗi xảy ra.");
    } finally {
      setLoading(false);
    }
  };

  // Hàm xử lý xác thực OTP
  const handleRecover = async (values) => {
    setLoading(true);
    const payload = {
      email: email,
      otp: values.otp,
      newPassword: values.newPassword,
      confirmPassword: values.confirmPassword,
    };
    try {
      const response = await authApi.recoverPassword(payload);

      setStep("success");
    } catch (err) {
      message.error(err.response?.data?.message || "Có lỗi xảy ra.");
    } finally {
      setLoading(false);
    }
  };

  // Hàm gửi lại OTP
  const handleResendOtp = async () => {
    try {
      const response = await authApi.regenerateOtp({ email });

      setTimer(10);
      message.success("Mã OTP đã được gửi lại tới email của bạn.");
    } catch (err) {
      message.error(err.response?.data?.message || "Có lỗi xảy ra.");
    }
  };

  // Tiêu đề cho từng bước
  const getTitle = () => {
    switch (step) {
      case "forgot":
        return "Quên mật khẩu";
      case "recover":
        return "Khôi phục mật khẩu";
      case "success":
        return "Hoàn tất khôi phục";
      default:
        return "";
    }
  };
  return (
    <div>
      <Title level={3} style={{ textAlign: "center", marginBottom: "10px" }}>
        {getTitle()}
      </Title>

      {step === "forgot" && (
        <Form form={forgotForm} layout="vertical" onFinish={handleForgot}>
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: "Vui lòng nhập email!" },
              { type: "email", message: "Định dạng email không hợp lệ!" },
            ]}
          >
            <Input placeholder="Email" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>
              Xác nhận
            </Button>
          </Form.Item>
          <Button type="default" block onClick={handleOpenLogin}>
            Trở lại
          </Button>
        </Form>
      )}

      {step === "recover" && (
        <div>
          <Text>
            Mã OTP đã được gửi tới email <strong>{email}</strong>. Vui lòng sử
            dụng mã OTP nhận được để khôi phục mật khẩu.
          </Text>
          <br />
          <br />
          <Form form={recoverForm} layout="vertical" onFinish={handleRecover}>
            <Form.Item
              name="otp"
              rules={[
                { required: true, message: "Vui lòng nhập đủ OTP" },
                {
                  pattern: /^\d{6}$/,
                  message: "Định dạng OTP không hợp lệ! (6 chữ số)",
                },
              ]}
              style={{ display: "flex", justifyContent: "center" }}
            >
              <Input.OTP size="large" />
            </Form.Item>

            <Form.Item
              label="Mật khẩu mới"
              name="newPassword"
              rules={[
                { required: true, message: "Vui lòng nhập mật khẩu mới!" },
                { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự!" },
              ]}
            >
              <Input.Password placeholder="Mật khẩu mới" />
            </Form.Item>

            <Form.Item
              label="Nhập lại mật khẩu mới"
              name="confirmPassword"
              dependencies={["newPassword"]} // Thêm dependencies
              rules={[
                { required: true, message: "Vui lòng nhập lại mật khẩu mới!" },
                { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự!" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("newPassword") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error("Mật khẩu không khớp!"));
                  },
                }),
              ]}
            >
              <Input.Password placeholder="Nhập lại mật khẩu mới" />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" block loading={loading}>
                Xác nhận
              </Button>
            </Form.Item>
          </Form>
          <Text>
            Thời gian còn lại:{" "}
            <strong>
              {Math.floor(timer / 60)} phút {timer % 60} giây
            </strong>
          </Text>
          <br />
          <Button
            type="link"
            onClick={handleResendOtp}
            disabled={timer != 0}
            style={{ marginTop: "20px" }}
          >
            Gửi lại mã OTP
          </Button>
          <br />
          <Button
            type="link"
            onClick={handleBackForgot}
            style={{ marginTop: "10px" }}
          >
            Trở lại
          </Button>
        </div>
      )}

      {step === "success" && (
        <Result
          status="success"
          title="Khôi phục mật khẩu thành công!"
          subTitle="Bạn có thể đăng nhập ngay bây giờ."
          extra={[
            <Button type="primary" key="login" onClick={handleOpenLogin}>
              Đăng nhập ngay
            </Button>,
          ]}
        />
      )}
    </div>
  );
};

export default ForgotPasswordForm;
