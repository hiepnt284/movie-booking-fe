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

import Paragraph from "antd/es/typography/Paragraph";
import { MODAL_TYPES } from "../../store/modalTypes";
import { openModal } from "../../store/slices/modalSlice";

const { Text, Title } = Typography;
const { Option } = Select;

// Định nghĩa các tùy chọn giới tính
const genderOptions = [
  { label: "Nam", value: "MALE" },
  { label: "Nữ", value: "FEMALE" },
];

const RegisterMultiStepForm = () => {
  const dispatch = useDispatch();
  const [step, setStep] = useState("register"); // 'register', 'verifyOtp', 'success'
  const [registerForm] = Form.useForm();
  const [otpForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [timer, setTimer] = useState(300); // 5 phút = 300 giây

  const handleOpenLogin = () => {
    dispatch(openModal({ modalType: MODAL_TYPES.LOGIN }));
  };
  // Đếm ngược thời gian OTP
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

  // Hàm xử lý đăng ký
  const handleRegister = async (values) => {
    setLoading(true);
    try {
      // Định dạng ngày sinh từ moment object sang "dd/MM/yyyy"
      const formattedDob = values.dob ? values.dob.format("DD/MM/YYYY") : null;

      const payload = {
        email: values.email,
        password: values.password,
        phoneNumber: values.phoneNumber,
        fullName: values.fullName,
        gender: values.gender,
        dob: formattedDob,
      };

      if (email != values.email) {
        setTimer(300);
        setEmail(values.email);
        const response = await authApi.registerUser(payload);
      }

      setStep("verifyOtp");
    } catch (err) {
      message.error(err.response?.data?.message || "Có lỗi xảy ra.");
    } finally {
      setLoading(false);
    }
  };

  // Hàm xử lý xác thực OTP
  const handleVerifyOtp = async (values) => {
    console.log(values);

    setLoading(true);
    const payload = {
      email: email,
      otp: values.otp,
    };
    try {
      const response = await authApi.verifyOtp(payload);

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

      setTimer(300);
      message.success("Mã OTP đã được gửi lại tới email của bạn.");
    } catch (err) {
      message.error(err.response?.data?.message || "Có lỗi xảy ra.");
    }
  };

  // Hàm đóng modal sau khi hoàn tất
  const handleClose = () => {
    setStep("register");
  };

  // Tiêu đề cho từng bước
  const getTitle = () => {
    switch (step) {
      case "register":
        return "Đăng ký tài khoản";
      case "verifyOtp":
        return "Xác thực tài khoản";
      case "success":
        return "Hoàn tất đăng ký";
      default:
        return "";
    }
  };

  return (
    <div>
      <Title level={3} style={{ textAlign: "center", marginBottom: "10px" }}>
        {getTitle()}
      </Title>

      {step === "register" && (
        <Form form={registerForm} layout="vertical" onFinish={handleRegister}>
          <Form.Item
            label="Họ và Tên"
            name="fullName"
            rules={[{ required: true, message: "Vui lòng nhập họ và tên!" }]}
          >
            <Input placeholder="Họ và Tên" />
          </Form.Item>

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

          <Form.Item
            label="Mật khẩu"
            name="password"
            rules={[
              { required: true, message: "Vui lòng nhập mật khẩu!" },
              { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự!" },
            ]}
          >
            <Input.Password placeholder="Mật khẩu" />
          </Form.Item>

          <Form.Item
            label="Số điện thoại"
            name="phoneNumber"
            rules={[
              { required: true, message: "Vui lòng nhập số điện thoại!" },
              {
                pattern: /^\d{10}$/,
                message: "Định dạng số điện thoại không hợp lệ! (10 chữ số)",
              },
            ]}
          >
            <Input placeholder="Số điện thoại" />
          </Form.Item>

          <Form.Item
            label="Giới tính"
            name="gender"
            rules={[{ required: true, message: "Vui lòng chọn giới tính!" }]}
          >
            <Select placeholder="Chọn giới tính">
              {genderOptions.map((gender) => (
                <Option key={gender.value} value={gender.value}>
                  {gender.label}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Ngày sinh"
            name="dob"
            rules={[{ required: true, message: "Vui lòng chọn ngày sinh!" }]}
          >
            <DatePicker
              format="DD/MM/YYYY"
              placeholder="Chọn ngày sinh"
              style={{ width: "100%" }}
              disabledDate={(currentDate) =>
                currentDate && currentDate > moment().endOf("day")
              }
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>
              Đăng ký
            </Button>
          </Form.Item>
          <Paragraph style={{ textAlign: "center" }}>
            Bạn đã có tài khoản?
          </Paragraph>
          <Button
            type="default"
            block
            variant="outlined"
            color="primary"
            onClick={handleOpenLogin}
          >
            Đăng nhập
          </Button>
        </Form>
      )}

      {step === "verifyOtp" && (
        <div>
          <Text>
            Mã OTP đã được gửi tới email <strong>{email}</strong>. Vui lòng nhập
            mã OTP để kích hoạt tài khoản.
          </Text>
          <br />
          <br />
          <Form form={otpForm} layout="vertical" onFinish={handleVerifyOtp}>
            {/* <Form.Item
              label="Mã OTP"
              name="otp"
              rules={[{ required: true, message: "Vui lòng nhập mã OTP!" }]}
            >
              <Input placeholder="Mã OTP" />
            </Form.Item> */}

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

            <Form.Item>
              <Button type="primary" htmlType="submit" block loading={loading}>
                Xác thực
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
            onClick={handleClose}
            style={{ marginTop: "10px" }}
          >
            Trở lại
          </Button>
        </div>
      )}

      {step === "success" && (
        <Result
          status="success"
          title="Tài khoản của bạn đã được kích hoạt thành công"
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

export default RegisterMultiStepForm;
