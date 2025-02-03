import React, { useEffect } from "react";
import { Form, Input, Button, Typography, message } from "antd";
import { login } from "../../store/slices/authSlice";
import { useDispatch, useSelector } from "react-redux";
import { MODAL_TYPES } from "../../store/modalTypes";
import { closeModal, openModal } from "../../store/slices/modalSlice";
import Paragraph from "antd/es/typography/Paragraph";
import { Link, useNavigate } from "react-router-dom";
const { Title } = Typography;

import { GoogleOutlined } from "@ant-design/icons";

const LoginForm = () => {
  const getOauthGoogleUrl = () => {
    const { VITE_GOOGLE_CLIENT_ID, VITE_GOOGLE_AUTHORIZED_REDIRECT_URI } =
      import.meta.env;
    const rootUrl = "https://accounts.google.com/o/oauth2/v2/auth";
    const options = {
      redirect_uri: VITE_GOOGLE_AUTHORIZED_REDIRECT_URI,
      client_id: VITE_GOOGLE_CLIENT_ID,
      access_type: "offline",
      response_type: "code",
      prompt: "consent",
      scope: [
        "https://www.googleapis.com/auth/userinfo.email",
        "https://www.googleapis.com/auth/userinfo.profile",
        "https://www.googleapis.com/auth/user.birthday.read",
        "https://www.googleapis.com/auth/user.gender.read",
        "https://www.googleapis.com/auth/user.phonenumbers.read",
      ].join(" "),
    };
    const qs = new URLSearchParams(options);
    return `${rootUrl}?${qs.toString()}`;
  };
  const oauthURL = getOauthGoogleUrl();
  const [loginForm] = Form.useForm();
  const navigate = useNavigate();

  const dispatch = useDispatch();
  const { loading, user } = useSelector((state) => state.auth);

  const handleLogin = async (values) => {
    const payload = {
      email: values.email,
      password: values.password,
    };
    dispatch(login({ payload, isLoginGg: false }))
      .unwrap()
      .then((res) => {
        dispatch(closeModal());
        if (
          res.userResponse.role == "ADMIN" ||
          res.userResponse.role == "MANAGER"
          
        ) {
          navigate("admin");
        }
        if (res.userResponse.role == "STAFF") {
          navigate("admin/scan-qr");
        }
          message.success("Đăng nhập thành công");
      })
      .catch((error) => {
        message.error(error.message || "Có lỗi xảy ra.");
      });
  };

  const handleOpenRegister = () => {
    dispatch(openModal({ modalType: MODAL_TYPES.REGISTER_MULTI_STEP }));
  };

  const handleOpenForgot = () => {
    dispatch(openModal({ modalType: MODAL_TYPES.FORGOT_PASSWORD }));
  };

  return (
    <div>
      <Title level={3} style={{ textAlign: "center", marginBottom: "10px" }}>
        Đăng nhập
      </Title>
      <Form form={loginForm} layout="vertical" onFinish={handleLogin}>
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
        <Button
          type="link"
          color="primary"
          onClick={handleOpenForgot}
          style={{ paddingLeft: "0" }}
        >
          Bạn quên mật khẩu?
        </Button>
        <Form.Item>
          <Button type="primary" htmlType="submit" block loading={loading}>
            Đăng nhập
          </Button>
        </Form.Item>
      </Form>
      <Link to={oauthURL}>
        <Button type="default" block variant="outlined" color="primary">
          Đăng nhập bằng Google <GoogleOutlined />
        </Button>
      </Link>
      <Paragraph style={{ textAlign: "center", marginTop: "20px" }}>
        Bạn chưa có tài khoản?
      </Paragraph>
      <Button
        type="default"
        block
        variant="outlined"
        color="primary"
        onClick={handleOpenRegister}
      >
        Đăng ký
      </Button>
    </div>
  );
};

export default LoginForm;
