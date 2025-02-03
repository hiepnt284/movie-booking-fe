import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Upload,
  Space,
  message,
  InputNumber,
  Switch,
  Flex,
  ConfigProvider,
  Row,
  Col,
  DatePicker,
  Select,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UploadOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import staffApi from "../api/staffApi";
import Title from "antd/es/typography/Title";
import useDebounce from "../customHook/useDebounce";
import theaterApi from "../api/theaterApi";
import moment from "moment";
import dayjs from "dayjs";
import { useSelector } from "react-redux";
const genderOptions = [
  { label: "Nam", value: "MALE" },
  { label: "Nữ", value: "FEMALE" },
];

const roleOptions = [
  { label: "Nhân viên", value: "STAFF" },
  { label: "Quản lý", value: "MANAGER" },
];

const statusOptions = [
  { label: "Hoạt động", value: "ACTIVE" },
  { label: "Không", value: "BANNED" },
];

const { TextArea } = Input;
const ManageStaff = () => {
  const { user } = useSelector((state) => state.auth);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 4,
    total: 0,
  });
  const [sort, setSort] = useState({
    sortBy: "id",
    sortDirection: "desc",
  });
  const [staffs, setStaffs] = useState([]);

  const [theaters, setTheaters] = useState([]);
  const [selectedTheater, setSelectedTheater] = useState();

  const [modalVisible, setModalVisible] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [staffForm] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const [keyword, setKeyword] = useState("");
  const [confirm, setConfirm] = useState(false);

  const debouncedKeyword = useDebounce(keyword, 800);

  useEffect(() => {
    const fetchTheater = async () => {
      setLoading(true);
      try {
        const res = await theaterApi.getAllForUser();
        // Nếu user là admin (theaterId === null), lấy tất cả rạp
        const filteredTheaters =
          user.theaterId === null
            ? res.result // Admin được phép xem tất cả rạp
            : res.result.filter((theater) => theater.id === user.theaterId);
        setTheaters(filteredTheaters);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    fetchTheater();
  }, [user.theaterId]); // Thêm dependency user.theaterId

  const fetchStaffs = async (params = {}) => {
    setLoading(true);
    try {
      const response = await staffApi.getAll({
        page: params.pagination?.current || pagination.current,
        pageSize: params.pagination?.pageSize || pagination.pageSize,
        sortBy: params.sorter?.field || sort.sortBy,
        direction:
          (params.sorter &&
            (params.sorter?.order === "ascend" ? "asc" : "desc")) ||
          sort.sortDirection,
        keyword: params.keyword,
        theaterId: selectedTheater,
      });

      setStaffs(response.result.content);

      setPagination({
        ...pagination,
        current: response.result.pageNo || pagination.current,
        pageSize: response.result.pageSize || pagination.pageSize,
        total: response.result.totalElements,
      });
      setSort({
        ...sort,
        sortBy: params.sorter?.field || sort.sortBy,
        sortDirection:
          (params.sorter &&
            (params.sorter?.order === "ascend" ? "asc" : "desc")) ||
          sort.sortDirection,
      });
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  // Gọi API khi debouncedKeyword thay đổi
  useEffect(() => {
    if (selectedTheater) {
      fetchStaffs({
        pagination: { current: 1 },
        keyword: debouncedKeyword,
        theaterId: selectedTheater,
      });
    }
  }, [debouncedKeyword]);

  const handleFinish = async (value) => {
    setLoading(true);

    const {
      email,
      password,
      phoneNumber,
      fullName,
      gender,
      dob,
      role,
      theaterId,
      isActive,
    } = value;

    const formattedDob = value.dob ? value.dob.format("DD/MM/YYYY") : null;

    const staffData = {
      email,
      password,
      phoneNumber,
      fullName,
      gender,
      dob: formattedDob,
      role,
      theaterId,
      isActive,
    };

    try {
      if (editingStaff) {
        await staffApi.update(editingStaff.id, staffData);
        message.success("Cập nhật thành công");
      } else {
        await staffApi.create(staffData);
        message.success("Thêm mới thành công");
      }
      handleCancel();
      fetchStaffs();
    } catch (error) {
      message.error(error.response?.data?.message || "Có lỗi xảy ra.");
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setModalVisible(false);
    setEditingStaff(null);
    staffForm.resetFields();
  };

  const openModal = (staff = null) => {
    if (staff) {
      setEditingStaff(staff);
      staffForm.setFieldsValue({
        ...staff,
        dob: staff?.dob ? dayjs(staff.dob, "DD-MM-YYYY") : null,
      });
    } else {
      staffForm.resetFields();
    }
    setModalVisible(true);
  };

  //   useEffect(() => {
  //     try {
  //       fetchStaffs();
  //     } catch (error) {
  //       message.error(error.response?.data?.message || "Có lỗi xảy ra.");
  //     }
  //   }, []);

  const handleTableChange = (pagination, filters, sorter, extra) => {
    try {
      fetchStaffs({
        pagination,
        sorter,
        keyword,
        theaterId: selectedTheater,
      });
    } catch (error) {
      message.error(error.response?.data?.message || "Có lỗi xảy ra.");
    }
  };

  const handleEdit = async (staffId) => {
    try {
      setLoading(true);
      const res = await staffApi.get(staffId);
      console.log(res.result);

      openModal(res.result);
    } catch (error) {
      message.error(error.response?.data?.message || "Có lỗi xảy ra.");
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!selectedTheater) {
      return;
    }
    setLoading(true);
    try {
      const response = await staffApi.getAll({
        page: 1,
        pageSize: 5,
        sortBy: "id",
        direction: "desc",
        keyword: "",
        theaterId: selectedTheater,
      });

      setStaffs(response.result.content);

      setPagination({
        ...pagination,
        current: response.result.pageNo || pagination.current,
        pageSize: response.result.pageSize || pagination.pageSize,
        total: response.result.totalElements,
      });
      setSort({
        ...sort,
        sortBy: "id",
        sortDirection: "desc",
      });

      setConfirm(true);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  //   const handleDelete = async (staffId) => {
  //     Modal.confirm({
  //       title: "Bạn có chắc muốn xóa",
  //       okText: "Có",
  //       okType: "danger",
  //       cancelText: "Không",
  //       onOk: async () => {
  //         try {
  //           await staffApi.delete(staffId);
  //           message.success("Xóa thành công");
  //           fetchStaffs();
  //         } catch (error) {
  //           message.error(error.response?.data?.message || "Có lỗi xảy ra.");
  //         } finally {
  //           setLoading(false);
  //         }
  //       },
  //     });
  //   };
  const columns = [
    {
      title: "Mã",
      dataIndex: "id",
      sorter: true,
      align: "center",
    },
    {
      title: "Email",
      dataIndex: "email",
      sorter: true,
      align: "center",
    },
    {
      title: "SĐT",
      dataIndex: "phoneNumber",
      sorter: true,
      align: "center",
    },
    {
      title: "Tên",
      dataIndex: "fullName",
      sorter: true,
      align: "center",
    },
    {
      title: "Giới tính",
      dataIndex: "gender",
      sorter: true,
      align: "center",
      render: (gender) => (gender === "MALE" ? "Nam" : "Nữ"),
    },
    {
      title: "Ngày sinh",
      dataIndex: "dob",
      sorter: true,
      align: "center",
    },
    {
      title: "Chức vụ",
      dataIndex: "role",
      sorter: true,
      align: "center",
      render: (role) => (role === "STAFF" ? "Nhân viên" : "Quản lý"),
    },
    {
      title: "Trạng thái",
      dataIndex: "isActive",
      align: "center",
      sorter: true,
      render: (isActive) => (isActive === "ACTIVE" ? "Hoạt động" : "Ẩn"),
    },
    {
      title: "Hành động",
      dataIndex: "actions",
      align: "center",
      render: (_, record) => (
        <Space size="middle">
          <Button
            icon={<EditOutlined />}
            onClick={() => handleEdit(record.id)}
            loading={loading}
            type="primary"
          >
            Chỉnh sửa
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <ConfigProvider
      theme={{
        components: {
          Table: {
            headerBg: "#b3d3ff",
            headerBorderRadius: 0,
            borderColor: "gray",
            cellFontSize: 16,
            cellPaddingBlock: 10,
            cellPaddingInline: 10,
          },
          Select: {},
        },
      }}
    >
      <Title level={4}>Quản lý nhân viên</Title>
      <Space>
        <Select
          placeholder="Chọn rạp chiếu"
          value={selectedTheater}
          loading={loading}
          style={{ width: 200 }}
          onChange={(value) => setSelectedTheater(value)}
        >
          {theaters.map((t) => (
            <Select.Option key={t.id} value={t.id}>
              {t.name}
            </Select.Option>
          ))}
        </Select>

        <Button type="primary" onClick={handleConfirm}>
          Xác nhận
        </Button>
      </Space>
      {confirm && (
        <div>
          <Flex gap={20} style={{ marginTop: "20px" }}>
            <Input
              size="middle"
              prefix={<SearchOutlined />}
              placeholder="Search"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            ></Input>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              size="middle"
              onClick={() => openModal()}
            >
              Thêm nhân viên mới
            </Button>
          </Flex>
          <br />
          <Table
            columns={columns}
            rowKey={(record) => record.id}
            dataSource={staffs}
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: pagination.total,
              showSizeChanger: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} items`,
              pageSizeOptions: ["1", "4", "10", "20", "50"],
            }}
            loading={loading}
            onChange={handleTableChange}
            bordered
          />
        </div>
      )}

      <Modal
        open={modalVisible}
        title={editingStaff ? "Chỉnh sửa nhân viên" : "Thêm nhân viên"}
        onCancel={handleCancel}
        footer={null}
        destroyOnClose
        forceRender
        style={{
          top: "10px",
        }}
        width={"1000px"}
      >
        <Form form={staffForm} layout="vertical" onFinish={handleFinish}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Email"
                name="email"
                rules={[
                  { required: true, message: "Vui lòng nhập email!" },
                  { type: "email", message: "Định dạng email không hợp lệ!" },
                ]}
              >
                <Input placeholder="Email" disabled={editingStaff} />
              </Form.Item>
            </Col>
            <Col span={12}>
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
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Họ và Tên"
                name="fullName"
                rules={[
                  { required: true, message: "Vui lòng nhập họ và tên!" },
                ]}
              >
                <Input placeholder="Họ và Tên" disabled={editingStaff} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Số điện thoại"
                name="phoneNumber"
                rules={[
                  { required: true, message: "Vui lòng nhập số điện thoại!" },
                  {
                    pattern: /^\d{10}$/,
                    message:
                      "Định dạng số điện thoại không hợp lệ! (10 chữ số)",
                  },
                ]}
              >
                <Input placeholder="Số điện thoại" disabled={editingStaff} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Giới tính"
                name="gender"
                rules={[
                  { required: true, message: "Vui lòng chọn giới tính!" },
                ]}
              >
                <Select placeholder="Chọn giới tính" disabled={editingStaff}>
                  {genderOptions.map((gender) => (
                    <Option key={gender.value} value={gender.value}>
                      {gender.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Ngày sinh"
                name="dob"
                rules={[
                  { required: true, message: "Vui lòng chọn ngày sinh!" },
                ]}
              >
                <DatePicker
                  format="DD/MM/YYYY"
                  placeholder="Chọn ngày sinh"
                  style={{ width: "100%" }}
                  disabledDate={(currentDate) =>
                    currentDate && currentDate > moment().endOf("day")
                  }
                  disabled={editingStaff}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                label="Chức vụ"
                name="role"
                rules={[{ required: true, message: "Vui lòng chọn chức vụ!" }]}
              >
                <Select placeholder="Chọn chức vụ">
                  {roleOptions.map((role) => (
                    <Option key={role.value} value={role.value}>
                      {role.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="Rạp"
                name="theaterId"
                rules={[{ required: true, message: "Vui lòng chọn rạp!" }]}
              >
                <Select placeholder="Chọn rạp">
                  {theaters
                    .filter((theater) => theater.id === selectedTheater)
                    .map((t) => (
                      <Select.Option key={t.id} value={t.id}>
                        {t.name}
                      </Select.Option>
                    ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="Trạng thái"
                name="isActive"
                rules={[
                  { required: true, message: "Vui lòng chọn trạng thái!" },
                ]}
              >
                <Select placeholder="Chọn trạng thái">
                  {statusOptions.map((status) => (
                    <Option key={status.value} value={status.value}>
                      {status.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item>
            <Space style={{ display: "flex", justifyContent: "flex-end" }}>
              <Button onClick={handleCancel}>Hủy</Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                Xác nhận
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </ConfigProvider>
  );
};

export default ManageStaff;
