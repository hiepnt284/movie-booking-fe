import React, { useEffect, useRef, useState } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Upload,
  Space,
  message,
  ConfigProvider,
  Flex,
  Switch,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import postApi from "../api/postApi";
import Title from "antd/es/typography/Title";
import useDebounce from "../customHook/useDebounce";
import ReactQuillEditor from "../components/ReactQuillEditor";

const ManagePost = () => {
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 4,
    total: 0,
  });
  const [sort, setSort] = useState({
    sortBy: "id",
    sortDirection: "desc",
  });
  const [posts, SetPosts] = useState([]);
  const [imgFileList, setImgFileList] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [postForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [content, setContent] = useState("");

  const debouncedKeyword = useDebounce(keyword, 800);

  const fetchPosts = async (params = {}) => {
    setLoading(true);
    try {
      const response = await postApi.getAll({
        page: params.pagination?.current || pagination.current,
        pageSize: params.pagination?.pageSize || pagination.pageSize,
        sortBy: params.sorter?.field || sort.sortBy,
        direction:
          (params.sorter &&
            (params.sorter?.order === "ascend" ? "asc" : "desc")) ||
          sort.sortDirection,
        keyword: params.keyword,
      });
      SetPosts(response.result.content);
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

  useEffect(() => {
    fetchPosts({
      pagination: { current: 1 },
      keyword: debouncedKeyword,
    });
  }, [debouncedKeyword]);

  const handleFinish = async (value) => {
    setLoading(true);
    const { title, isActive, thumbnail } = value;
    const carouselData = { title, content, isActive };
    console.log(carouselData);

    const thumbnailFile = thumbnail?.fileList?.[0]?.originFileObj || null;

    try {
      if (editingPost) {
        await postApi.update(editingPost.id, carouselData, thumbnailFile);
        message.success("Cập nhật thành công");
      } else {
        await postApi.create(carouselData, thumbnailFile);
        message.success("Thêm mới thành công");
      }
      handleCancel();
      fetchPosts();
    } catch (error) {
      message.error("Có lỗi xảy ra.");
      console.log(error);
      
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setModalVisible(false);
    setEditingPost(null);
    postForm.resetFields();
    setImgFileList([]);
    setContent("");
  };

  const openModal = (post = null) => {
    if (post) {
      setImgFileList(
        post?.thumbnail
          ? [
              {
                uid: "-1",
                name: "thumbnail.jpg",
                status: "done",
                url: post.thumbnail,
              },
            ]
          : []
      );
      setEditingPost(post);
      postForm.setFieldsValue(post);

      setContent(post.content);
    } else {
      postForm.resetFields();
      setContent("");
    }
    setModalVisible(true);
  };

  const handleImgChange = ({ fileList }) => {
    setImgFileList(fileList);
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleTableChange = (pagination, filters, sorter, extra) => {
    try {
      fetchPosts({
        pagination,
        sorter,
        keyword,
      });
    } catch (error) {
      message.error(error.response?.data?.message || "Có lỗi xảy ra.");
    }
  };

  const handleEdit = async (postId) => {
    try {
      setLoading(true);
      const res = await postApi.get(postId);

      openModal(res.result);
    } catch (error) {
      message.error(error.response?.data?.message || "Có lỗi xảy ra.");
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (postId) => {
    Modal.confirm({
      title: "Bạn có chắc muốn xóa",
      okText: "Có",
      okType: "danger",
      cancelText: "Không",
      onOk: async () => {
        try {
          await postApi.delete(postId);
          message.success("Xóa thành công");
          fetchPosts();
        } catch (error) {
          message.error(error.response?.data?.message || "Có lỗi xảy ra.");
        } finally {
          setLoading(false);
        }
      },
    });
  };
  const handleContentChange = (value) => {
    console.log(value);

    setContent(value);
  };

  const columns = [
    { title: "Mã", dataIndex: "id", sorter: true },
    { title: "Tiêu đề", dataIndex: "title", sorter: true },
    {
      title: "Ảnh minh họa",
      dataIndex: "thumbnail",
      render: (text) =>
        text ? (
          <img src={text} alt="Thumbnail" style={{ width: 150, height: 75 }} />
        ) : (
          "N/A"
        ),
    },
    {
      title: "Trạng thái",
      dataIndex: "isActive",
      render: (isActive) => (isActive ? "Hoạt động" : "Không"),
      sorter: true,
    },
    {
      title: "Hành động",
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
        components: { Table: { headerBg: "#b3d3ff", borderColor: "gray" } },
      }}
    >
      <div>
        <Title level={4}>Quản lý post</Title>
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
          dataSource={posts}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            pageSizeOptions: ["4", "10", "20"],
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} trong tổng ${total} mục`,
          }}
          loading={loading}
          onChange={handleTableChange}
          bordered
        />
      </div>

      <Modal
        open={modalVisible}
        title={editingPost ? "Chỉnh sửa post" : "Thêm post"}
        onCancel={handleCancel}
        footer={null}
        destroyOnClose
        width="1200px"
        style={{
          top: 20,
        }}
      >
        <Form form={postForm} layout="vertical" onFinish={handleFinish}>
          <Form.Item
            label="Tiêu đề"
            name="title"
            rules={[{ required: true, message: "Vui lòng nhập tiêu đề!" }]}
          >
            <Input placeholder="Nhập tiêu đề bài viết" />
          </Form.Item>
          <Form.Item name="thumbnail" label="Thumbnail">
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
          <Form.Item
            style={{ marginTop: "50px" }}
            name="isActive"
            label="Trạng thái"
            valuePropName="checked"
            initialValue={true}
          >
            <Switch defaultChecked={true} />
          </Form.Item>
          <Form.Item
            label="*Nội dung"
            rules={[{ required: true, message: "Vui lòng nhập tiêu đề!" }]}
          >
            <ReactQuillEditor
              content={content}
              handleChange={handleContentChange}
            />
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

export default ManagePost;
