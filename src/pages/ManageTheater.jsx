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
  Select,
  DatePicker,
  InputNumber,
  Switch,
  Flex,
  ConfigProvider,
  Row,
  Col,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UploadOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import theaterApi from "../api/theaterApi";
import Title from "antd/es/typography/Title";
import useDebounce from "../customHook/useDebounce";
import ManageRoomModal from "../components/ManageRoomModal";

const { TextArea } = Input;
const ManageTheater = () => {
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 4,
    total: 0,
  });
  const [sort, setSort] = useState({
    sortBy: "id",
    sortDirection: "desc",
  });
  const [theaters, setTheaters] = useState([]);
  const [theaterId, setTheaterId] = useState();
  const [imgFileList, SetImgFileList] = useState([]);

  const [modalVisible, setModalVisible] = useState(false);

  const [modalManageRoomVisible, setModalManageRoomVisible] = useState(false);

  const [editingTheater, setEditingTheater] = useState(null);
  const [theaterForm] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const [keyword, setKeyword] = useState("");

  const debouncedKeyword = useDebounce(keyword, 800);
  const fetchTheaters = async (params = {}) => {
    setLoading(true);
    try {
      const response = await theaterApi.getAll({
        page: params.pagination?.current || pagination.current,
        pageSize: params.pagination?.pageSize || pagination.pageSize,
        sortBy: params.sorter?.field || sort.sortBy,
        direction:
          (params.sorter &&
            (params.sorter?.order === "ascend" ? "asc" : "desc")) ||
          sort.sortDirection,
        keyword: params.keyword,
      });

      setTheaters(response.result.content);

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
    fetchTheaters({
      pagination: { current: 1 },
      keyword: debouncedKeyword,
    });
  }, [debouncedKeyword]);

  const handleFinish = async (value) => {
    setLoading(true);
    console.log(value);

    const { name, address, email, phone, description, img } = value;

    const theaterData = {
      name,
      address,
      email,
      phone,
      description,
    };

    const imgFile =
      img && img?.fileList?.length > 0 ? img.fileList[0].originFileObj : null;

    try {
      if (editingTheater) {
        await theaterApi.update(editingTheater.id, theaterData, imgFile);
        message.success("Theater update successfully");
      } else {
        await theaterApi.create(theaterData, imgFile);
        message.success("Theater created successfully");
      }
      handleCancel();
      fetchTheaters();
    } catch (error) {
      message.error(error.response?.data?.message || "Có lỗi xảy ra.");
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setModalVisible(false);
    setEditingTheater(null);
    theaterForm.resetFields();
    SetImgFileList([]);
  };

  const handleCancelManageRoom = () => {
    setModalManageRoomVisible(false);
  };

  const openModal = (theater = null) => {
    if (theater) {
      const initialImgFileList = theater?.img
        ? [
            {
              uid: "-1", // Unique identifier for the file
              name: "img.jpg", // Tên file hiển thị
              status: "done", // Trạng thái đã upload thành công
              url: theater.img, // URL từ database
            },
          ]
        : [];

      SetImgFileList(initialImgFileList); // Đặt fileList cho img

      setEditingTheater(theater);
      theaterForm.setFieldsValue({
        ...theater,
      });
    } else {
      theaterForm.resetFields();
    }
    setModalVisible(true);
  };

  // Hàm xử lý khi người dùng chọn file
  const handleImgChange = ({ fileList }) => {
    SetImgFileList(fileList); // Cập nhật fileList khi có file mới được chọn
  };

  useEffect(() => {
    try {
      fetchTheaters();
    } catch (error) {
      message.error(error.response?.data?.message || "Có lỗi xảy ra.");
    }
  }, []);

  const handleTableChange = (pagination, filters, sorter, extra) => {
    try {
      fetchTheaters({
        pagination,
        sorter,
        keyword,
      });
    } catch (error) {
      message.error(error.response?.data?.message || "Có lỗi xảy ra.");
    }
  };

  const handleEdit = async (theaterId) => {
    try {
      setLoading(true);
      const res = await theaterApi.get(theaterId);
      openModal(res.result);
    } catch (error) {
      message.error(error.response?.data?.message || "Có lỗi xảy ra.");
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleManageRoom = async (theaterId) => {
    try {
      setTheaterId(theaterId);
      setModalManageRoomVisible(true);
    } catch (error) {
      message.error(error.response?.data?.message || "Có lỗi xảy ra.");
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (theaterId) => {
    Modal.confirm({
      title: "Are you sure you want to delete this theater?",
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      onOk: async () => {
        try {
          await theaterApi.delete(theaterId);
          message.success("Theater deleted successfully");
          fetchTheaters();
        } catch (error) {
          message.error(error.response?.data?.message || "Có lỗi xảy ra.");
        } finally {
          setLoading(false);
        }
      },
    });
  };
  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      sorter: true,
    },
    {
      title: "Name",
      dataIndex: "name",
      sorter: true,
    },
    {
      title: "Address",
      dataIndex: "address",
      sorter: true,
    },
    {
      title: "Email",
      dataIndex: "email",
      sorter: true,
    },
    {
      title: "Phone",
      dataIndex: "phone",
      sorter: true,
    },
    {
      title: "Image",
      dataIndex: "img",
      render: (text) =>
        text ? (
          <img src={text} alt="Image" style={{ width: 50, height: 75 }} />
        ) : (
          "N/A"
        ),
    },
    {
      title: "Actions",
      dataIndex: "actions",
      render: (_, record) => (
        <Space size="middle">
          <Button
            icon={<EditOutlined />}
            onClick={() => handleManageRoom(record.id)}
            loading={loading}
            type="primary"
          >
            Manage room
          </Button>
          <Button
            icon={<EditOutlined />}
            onClick={() => handleEdit(record.id)}
            loading={loading}
            type="primary"
          >
            Edit
          </Button>
          <Button
            icon={<DeleteOutlined />}
            danger
            onClick={() => handleDelete(record.id)}
            loading={loading}
          >
            Delete
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
            headerBorderRadius: 10,
            borderColor: "gray",
          },
          Select: {},
        },
      }}
    >
      <div>
        <Title level={4}>Quản lý rạp</Title>
        <Flex gap={20}>
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
            Thêm rạp mới
          </Button>
        </Flex>
        <br />
        <Table
          columns={columns}
          rowKey={(record) => record.id}
          dataSource={theaters}
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

      <Modal
        open={modalVisible}
        title={editingTheater ? "Edit Theater" : "Add Theater"}
        onCancel={handleCancel}
        footer={null}
        destroyOnClose
        forceRender
        style={{
          top: "10px",
        }}
        width={"1000px"}
      >
        <Form form={theaterForm} layout="vertical" onFinish={handleFinish}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="Tên"
                rules={[{ required: true, message: "Vui lòng nhập tên rạp" }]}
              >
                <Input placeholder="Nhập tên rạp" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="address"
                label="Địa chỉ"
                rules={[
                  { required: true, message: "Vui lòng nhập địa chỉ rạp" },
                ]}
              >
                <Input placeholder="Nhập địa chỉ rạp" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập email",
                  },
                ]}
              >
                <Input type="email" placeholder="Nhập email" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="phone"
                label="Hotline"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập hotline",
                  },
                ]}
              >
                <Input
                  placeholder="Nhập hotline"
                  onKeyDown={(event) => {
                    if (!/[0-9]/.test(event.key)) {
                      event.preventDefault(); // Chặn ký tự không phải số
                    }
                  }}
                />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="description"
            label="Mô tả"
            rules={[{ required: true, message: "Vui lòng nhập mô tả" }]}
          >
            <TextArea rows={4} placeholder="Nhập mô tả rạp" />
          </Form.Item>

          <Form.Item name="img" label="Image">
            <Upload
              listType="picture"
              beforeUpload={() => false} // Prevent automatic upload
              maxCount={1}
              accept="image/*"
              fileList={imgFileList} // Dùng state imgFileList để quản lý
              onChange={handleImgChange} // Gọi hàm handleImgChange khi có file mới
            >
              <Button icon={<UploadOutlined />}>Click để tải lên</Button>
            </Upload>
          </Form.Item>

          <Form.Item>
            <Space style={{ display: "flex", justifyContent: "flex-end" }}>
              <Button onClick={handleCancel}>Hủy</Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                Tạo
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      <ManageRoomModal
        isManageRoomOpen={modalManageRoomVisible}
        handleClose={handleCancelManageRoom}
        theaterId={theaterId}
      />
    </ConfigProvider>
  );
};

export default ManageTheater;
