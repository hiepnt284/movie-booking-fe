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
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UploadOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import carouselApi from "../api/carouselApi";
import Title from "antd/es/typography/Title";
import useDebounce from "../customHook/useDebounce";

const { TextArea } = Input;
const ManageCarousel = () => {
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 4,
    total: 0,
  });
  const [sort, setSort] = useState({
    sortBy: "id",
    sortDirection: "desc",
  });
  const [carousels, SetCarousels] = useState([]);
  const [imgFileList, setImgFileList] = useState([]);

  const [modalVisible, setModalVisible] = useState(false);
  const [editingCarousel, setEditingCarousel] = useState(null);
  const [carouselForm] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const [keyword, setKeyword] = useState("");

  const debouncedKeyword = useDebounce(keyword, 800);
  const fetchCarousels = async (params = {}) => {
    setLoading(true);
    try {
      const response = await carouselApi.getAll({
        page: params.pagination?.current || pagination.current,
        pageSize: params.pagination?.pageSize || pagination.pageSize,
        sortBy: params.sorter?.field || sort.sortBy,
        direction:
          (params.sorter &&
            (params.sorter?.order === "ascend" ? "asc" : "desc")) ||
          sort.sortDirection,
        keyword: params.keyword,
      });

      SetCarousels(response.result.content);

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
    fetchCarousels({
      pagination: { current: 1 },
      keyword: debouncedKeyword,
    });
  }, [debouncedKeyword]);

  const handleFinish = async (value) => {
    setLoading(true);
    console.log(value);

    const { name, link, isActive, img } = value;

    const carouselData = {
      name,
      link,
      isActive,
    };

    const posterFile =
      img && img?.fileList?.length > 0 ? img.fileList[0].originFileObj : null;

    try {
      if (editingCarousel) {
        await carouselApi.update(editingCarousel.id, carouselData, posterFile);
        message.success("Cập nhật thành công");
      } else {
        await carouselApi.create(carouselData, posterFile);
        message.success("Thêm mới thành công");
      }
      handleCancel();
      fetchCarousels();
    } catch (error) {
      message.error(error.response?.data?.message || "Có lỗi xảy ra.");
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setModalVisible(false);
    setEditingCarousel(null);
    carouselForm.resetFields();
    setImgFileList([]);
  };

  const openModal = (carousel = null) => {
    if (carousel) {
      const initialImgFileList = carousel?.img
        ? [
            {
              uid: "-1", // Unique identifier for the file
              name: "img.jpg", // Tên file hiển thị
              status: "done", // Trạng thái đã upload thành công
              url: carousel.img, // URL từ database
            },
          ]
        : [];

      setImgFileList(initialImgFileList); // Đặt fileList cho img

      setEditingCarousel(carousel);
      carouselForm.setFieldsValue({
        ...carousel,
      });
    } else {
      carouselForm.resetFields();
    }
    setModalVisible(true);
  };

  // Hàm xử lý khi người dùng chọn file
  const handleImgChange = ({ fileList }) => {
    setImgFileList(fileList); // Cập nhật fileList khi có file mới được chọn
  };

  useEffect(() => {
    try {
      fetchCarousels();
    } catch (error) {
      message.error(error.response?.data?.message || "Có lỗi xảy ra.");
    }
  }, []);

  const handleTableChange = (pagination, filters, sorter, extra) => {
    try {
      fetchCarousels({
        pagination,
        sorter,
        keyword,
      });
    } catch (error) {
      message.error(error.response?.data?.message || "Có lỗi xảy ra.");
    }
  };

  const handleEdit = async (carouselId) => {
    try {
      setLoading(true);
      const res = await carouselApi.get(carouselId);
      openModal(res.result);
    } catch (error) {
      message.error(error.response?.data?.message || "Có lỗi xảy ra.");
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (carouselId) => {
    Modal.confirm({
      title: "Bạn có chắc muốn xóa",
      okText: "Có",
      okType: "danger",
      cancelText: "Không",
      onOk: async () => {
        try {
          await carouselApi.delete(carouselId);
          message.success("Xóa thành công");
          fetchCarousels();
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
      title: "Mã",
      dataIndex: "id",
      sorter: true,
      align: "center",
    },
    {
      title: "Tên",
      dataIndex: "name",
      sorter: true,
      align: "center",
    },
    {
      title: "Liên kết ",
      dataIndex: "link",
      align: "center",
      sorter: true,
    },
    {
      title: "Ảnh",
      dataIndex: "img",
      align: "center",
      render: (text) =>
        text ? (
          <img src={text} alt="Image" style={{ width: 200, height: 94 }} />
        ) : (
          "N/A"
        ),
    },
    {
      title: "Trạng thái",
      dataIndex: "isActive",
      align: "center",
      render: (isActive) => (isActive ? "Hoạt động" : "Không"),
      sorter: true,
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
          <Button
            icon={<DeleteOutlined />}
            danger
            onClick={() => handleDelete(record.id)}
            loading={loading}
          >
            Xóa
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
      <div>
        <Title level={4}>Quản lý carousel</Title>
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
            Thêm mới
          </Button>
        </Flex>
        <br />
        <Table
          columns={columns}
          rowKey={(record) => record.id}
          dataSource={carousels}
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
        title={editingCarousel ? "Chỉnh sửa carousel" : "Thêm carousel"}
        onCancel={handleCancel}
        footer={null}
        destroyOnClose
        forceRender
        style={{
          top: "10px",
        }}
        width={"1000px"}
      >
        <Form form={carouselForm} layout="vertical" onFinish={handleFinish}>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="name"
                label="Tên"
                rules={[
                  { required: true, message: "Vui lòng nhập tên carousel" },
                ]}
              >
                <Input placeholder="Nhập tên carousel" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="link"
                label="Liên kết"
                rules={[{ required: true, message: "Vui lòng nhập liên kết" }]}
              >
                <Input placeholder="Nhập liên kết" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="isActive"
                label="Trạng thái"
                valuePropName="checked"
                initialValue={true}
              >
                <Switch defaultChecked={true} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="img" label="Ảnh">
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
                Xác nhận
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </ConfigProvider>
  );
};

export default ManageCarousel;
