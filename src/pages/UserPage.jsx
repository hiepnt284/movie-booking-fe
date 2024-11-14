import React, { useEffect, useState } from "react";
import {
  Form,
  Input,
  Button,
  Table,
  Modal,
  message,
  Spin,
  Tabs,
  Row,
  Col,
} from "antd";
import userApi from "../api/userApi";
import Title from "antd/es/typography/Title";
import { Avatar, Typography, Divider, Progress, Tooltip } from "antd";
import { GiftOutlined, RightOutlined, StarOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

const UserPage = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [bookingHistory, setBookingHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isPasswordModalVisible, setPasswordModalVisible] = useState(false);

  // Lấy thông tin người dùng
  const fetchUserInfo = async () => {
    setLoading(true);
    try {
      const response = await userApi.getInfo();
      setUserInfo(response.result);
    } catch (error) {
      message.error("Failed to fetch user information");
    } finally {
      setLoading(false);
    }
  };

  // Lấy lịch sử booking
  const fetchBookingHistory = async () => {
    setLoading(true);
    try {
      const response = await userApi.getBookingHistory();
      setBookingHistory(response.result || []);
    } catch (error) {
      message.error("Failed to fetch booking history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserInfo();
    fetchBookingHistory();
  }, []);

  // Xử lý đổi mật khẩu
  const onFinishChangePassword = async (values) => {
    try {
      await userApi.changePassword(values);
      message.success("Password changed successfully");
      setPasswordModalVisible(false);
    } catch (error) {
      message.error(
        error.response?.data?.message || "Failed to change password"
      );
    }
  };

  const columns = [
    { title: "Mã hóa đơn", dataIndex: "bookingCode", key: "bookingCode" },
    { title: "Phim", dataIndex: "movieTitle", key: "movieTitle" },
    {
      title: "Ngày đặt",
      dataIndex: "bookingDate",
      key: "bookingDate",
      render: (text) => dayjs(text).format("DD/MM/YYYY HH:mm:ss"),
    },
    {
      title: "Tổng tiền",
      dataIndex: "totalPrice",
      key: "totalPrice",
      render: (text) => text.toLocaleString()+ "đ",
    },
  ];

  return (
    <Spin spinning={loading}>
      <div style={{ padding: "20px 140px" }}>
        <div style={{ display: "flex", gap: "50px" }}>
          <div
            style={{
              flex: "1",
              backgroundColor: "white",
              marginTop: "12px",
              marginBottom: "30px",
              padding: "20px",
              boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)", // Thêm box shadow
            }}
          >
            {/* Avatar và tên người dùng */}
            <div style={{ textAlign: "center", marginBottom: "20px" }}>
              <Avatar
                size={80}
                icon={
                  <img
                    src={
                      userInfo?.avt
                        ? userInfo?.avt
                        : "https://bhdstar.vn/wp-content/assets/loodo/no-user.jpg"
                    }
                    alt="avatar"
                  />
                }
              />
              <Typography.Title level={5} style={{ marginTop: "10px" }}>
                {userInfo?.fullName}
              </Typography.Title>
              <div>
                <StarOutlined style={{ color: "#fadb14" }} />{" "}
                <span>0 Stars</span>
              </div>
            </div>

            <Divider />

            {/* Tổng chi tiêu */}
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Typography.Text strong>Tổng chi tiêu 2024</Typography.Text>
                <Tooltip title="Total spending in 2024">
                  <Typography.Text
                    style={{ marginLeft: "5px", color: "#1890ff" }}
                  >
                    ℹ️
                  </Typography.Text>
                </Tooltip>
              </div>
              <Typography.Title level={3} style={{ color: "orange" }}>
                0 ₫
              </Typography.Title>
            </div>

            {/* Progress bar */}
            <div style={{ marginTop: "20px" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "0 10px",
                }}
              >
                <span>0 ₫</span>
                <span>2.000.000 ₫</span>
                <span>4.000.000 ₫</span>
              </div>
              <Progress
                percent={0}
                showInfo={false}
                strokeColor="#1890ff"
                trailColor="#d9d9d9"
              />
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "0 10px",
                  marginTop: "10px",
                }}
              >
                <StarOutlined style={{ color: "#fadb14" }} />
                <GiftOutlined style={{ color: "#52c41a" }} />
                <StarOutlined style={{ color: "#faad14" }} />
              </div>
            </div>
            <Divider />
            {/* Thông tin thêm phía dưới */}
            <div style={{ marginTop: "20px" }}>
              <Row align="middle" style={{ marginBottom: "10px" }}>
                <Typography.Text strong>HOTLINE hỗ trợ: </Typography.Text>
                <Typography.Text
                  style={{ marginLeft: "5px", color: "#1890ff" }}
                >
                  19002224 (9:00 - 22:00)
                </Typography.Text>
                <RightOutlined
                  style={{ marginLeft: "auto", color: "#1890ff" }}
                />
              </Row>

              <Divider />

              <Row align="middle" style={{ marginBottom: "10px" }}>
                <Typography.Text strong>Email: </Typography.Text>
                <Typography.Text
                  style={{ marginLeft: "5px", color: "#1890ff" }}
                >
                  hotro@galaxystudio.vn
                </Typography.Text>
                <RightOutlined
                  style={{ marginLeft: "auto", color: "#1890ff" }}
                />
              </Row>

              <Divider />

              <Row align="middle">
                <Typography.Text strong>Câu hỏi thường gặp</Typography.Text>
                <RightOutlined
                  style={{ marginLeft: "auto", color: "#1890ff" }}
                />
              </Row>
            </div>
          </div>

          <div style={{ flex: "2" }}>
            <Tabs defaultActiveKey="1">
              <Tabs.TabPane tab="Thông Tin Cá Nhân" key="1">
                {userInfo && (
                  <Form
                    layout="vertical"
                    initialValues={userInfo}
                    style={{
                      backgroundColor: "white",
                      padding: 20,
                      boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)", // Thêm box shadow
                    }}
                    disabled
                  >
                    <Row gutter={18}>
                      <Col span={12}>
                        <Form.Item label="Họ và tên" name="fullName">
                          <Input />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item label="Ngày sinh" name="dob">
                          <Input />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Row gutter={18}>
                      <Col span={12}>
                        <Form.Item label="Email" name="email">
                          <Input />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item label="Số điện thoại" name="phoneNumber">
                          <Input />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Row gutter={18}>
                      <Col span={12}>
                        <Form.Item label="Giới tính" name="gender">
                          <Input />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item label="Mật khẩu">
                          <Input.Password
                            value={12345678910}
                            addonAfter={
                              <Button
                                type="link"
                                onClick={() => setPasswordModalVisible(true)}
                                disabled={false}
                              >
                                Thay đổi
                              </Button>
                            }
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                  </Form>
                )}
              </Tabs.TabPane>

              <Tabs.TabPane tab="Lịch Sử Giao dịch" key="2">
                <Table
                  columns={columns}
                  dataSource={bookingHistory}
                  rowKey="id"
                />
              </Tabs.TabPane>
            </Tabs>
          </div>
        </div>

        <Modal
          title="Đổi mật khẩu"
          open={isPasswordModalVisible}
          footer={null}
          onCancel={() => setPasswordModalVisible(false)}
        >
          <Form
            name="changePassword"
            onFinish={onFinishChangePassword}
            layout="vertical"
          >
            <Form.Item
              name="oldPassword"
              label="Mật khẩu cũ"
              rules={[{ required: true, message: "Nhập mật khẩu cũ" }]}
            >
              <Input.Password />
            </Form.Item>
            <Form.Item
              name="newPassword"
              label="Mật khẩu mới"
              rules={[
                { required: true, message: "Nhập mật khẩu mới" },
                { min: 6, message: "Mật khẩu phải có tối thiểu 6 kí tự" },
              ]}
            >
              <Input.Password />
            </Form.Item>
            <Form.Item
              name="confirmPassword"
              label="Xác nhận mật khẩu mới"
              dependencies={["newPassword"]}
              rules={[
                { required: true, message: "Xác nhận mật khẩu mới" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("newPassword") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error("Mật khẩu không khớp"));
                  },
                }),
              ]}
            >
              <Input.Password />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" block>
                Cập nhật
              </Button>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </Spin>
  );
};

export default UserPage;
