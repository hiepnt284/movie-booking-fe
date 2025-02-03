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
import movieApi from "../api/movieApi";
import Title from "antd/es/typography/Title";
import dayjs from "dayjs";
import useDebounce from "../customHook/useDebounce";
import './style/Table.css'

const { Option } = Select;
const { TextArea } = Input;
const genreOptions = [
  { value: "Action", label: "Hành động" },
  { value: "Comedy", label: "Hài" },
  { value: "Drama", label: "Chính kịch" },
  { value: "Horror", label: "Kinh dị" },
  { value: "Romance", label: "Lãng mạn" },
  { value: "Sci-Fi", label: "Khoa học viễn tưởng" },
  { value: "Thriller", label: "Giật gân" },
  { value: "Documentary", label: "Tài liệu" },
  { value: "Animation", label: "Hoạt hình" },
  { value: "Fantasy", label: "Huyền bí" },
  { value: "Mystery", label: "Bí ẩn" },
  { value: "Adventure", label: "Phiêu lưu" },
  { value: "Crime", label: "Hình sự" },
  { value: "Musical", label: "Nhạc kịch" },
  { value: "Western", label: "Miền Tây" },
  { value: "Historical", label: "Lịch sử" },
  { value: "War", label: "Chiến tranh" },
];
const ManageMovie = () => {
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 4,
    total: 0,
  });
  const [sort, setSort] = useState({
    sortBy: "id",
    sortDirection: "desc",
  });
  const [movies, setMovies] = useState([]);
  const [posterFileList, setPosterFileList] = useState([]);

  const [modalVisible, setModalVisible] = useState(false);
  const [editingMovie, setEditingMovie] = useState(null);
  const [movieForm] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const [keyword, setKeyword] = useState("");

  const debouncedKeyword = useDebounce(keyword, 800);
  const fetchMovies = async (params = {}) => {
    setLoading(true);
    try {
      const response = await movieApi.getAll({
        page: params.pagination?.current || pagination.current,
        pageSize: params.pagination?.pageSize || pagination.pageSize,
        sortBy: params.sorter?.field || sort.sortBy,
        direction:
          (params.sorter &&
            (params.sorter?.order === "ascend" ? "asc" : "desc")) ||
          sort.sortDirection,
        keyword: params.keyword,
      });

      setMovies(response.result.content);

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
    fetchMovies({
      pagination: { current: 1 },
      keyword: debouncedKeyword,
    });
  }, [debouncedKeyword]);

  const handleFinish = async (value) => {
    setLoading(true);
    console.log(value);

    const {
      title,
      director,
      cast,
      ageRating,
      duration,
      releaseDate,
      trailer,
      description,
      genre,
      poster,
      isActive,
    } = value;

    const movieData = {
      title,
      director,
      cast,
      ageRating,
      duration,
      releaseDate: releaseDate ? releaseDate.format("DD-MM-YYYY") : null,
      trailer,
      description,
      genre: genre.join(", "),
      isActive,
    };

    const posterFile =
      poster && poster?.fileList?.length > 0
        ? poster.fileList[0].originFileObj
        : null;

    try {
      if (editingMovie) {
        await movieApi.update(editingMovie.id, movieData, posterFile);
        message.success("Cập nhật phim thành công");
      } else {
        await movieApi.create(movieData, posterFile);
        message.success("Thêm mới phim thành công");
      }
      handleCancel();
      fetchMovies();
    } catch (error) {
      message.error(error.response?.data?.message || "Có lỗi xảy ra.");
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setModalVisible(false);
    setEditingMovie(null);
    movieForm.resetFields();
    setPosterFileList([]);
  };

  const openModal = (movie = null) => {
    if (movie) {
      const genreArray = movie?.genre
        ? movie.genre.split(", ").map((g) => g.trim())
        : [];

      const initialPosterFileList = movie?.poster
        ? [
            {
              uid: "-1", // Unique identifier for the file
              name: "poster.jpg", // Tên file hiển thị
              status: "done", // Trạng thái đã upload thành công
              url: movie.poster, // URL từ database
            },
          ]
        : [];

      setPosterFileList(initialPosterFileList); // Đặt fileList cho poster

      setEditingMovie(movie);
      movieForm.setFieldsValue({
        ...movie,
        releaseDate: movie?.releaseDate
          ? dayjs(movie.releaseDate, "DD-MM-YYYY")
          : null,
        genre: genreArray,
      });
    } else {
      movieForm.resetFields();
    }
    setModalVisible(true);
  };

  // Hàm xử lý khi người dùng chọn file
  const handlePosterChange = ({ fileList }) => {
    setPosterFileList(fileList); // Cập nhật fileList khi có file mới được chọn
  };

  useEffect(() => {
    try {
      fetchMovies();
    } catch (error) {
      message.error(error.response?.data?.message || "Có lỗi xảy ra.");
    }
  }, []);

  const handleTableChange = (pagination, filters, sorter, extra) => {
    try {
      fetchMovies({
        pagination,
        sorter,
        keyword,
      });
    } catch (error) {
      message.error(error.response?.data?.message || "Có lỗi xảy ra.");
    }
  };

  const handleEdit = async (movieId) => {
    try {
      setLoading(true);
      const res = await movieApi.get(movieId);
      openModal(res.result);
    } catch (error) {
      message.error(error.response?.data?.message || "Có lỗi xảy ra.");
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (movieId) => {
    Modal.confirm({
      title: `Bạn có chắc muốn xóa phim với id = ${movieId}`,
      okText: "Có",
      okType: "danger",
      cancelText: "Không",
      onOk: async () => {
        try {
          await movieApi.delete(movieId);
          message.success("Xóa phim thành công");
          fetchMovies();
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
      title: "Mã phim",
      dataIndex: "id",
      sorter: true,
      align: "center",
    },
    {
      title: "Tiêu đề",
      dataIndex: "title",
      sorter: true,
      align: "center",
    },
    {
      title: "Độ tuổi",
      dataIndex: "ageRating",
      sorter: true,
      align: "center",
    },
    {
      title: "Thời lượng (phút)",
      dataIndex: "duration",
      sorter: true,
      align: "center",
    },
    {
      title: "Ngày phát hành",
      dataIndex: "releaseDate",
      sorter: true,
      align: "center",
    },
    {
      title: "Ảnh",
      dataIndex: "poster",
      align: "center",
      render: (text) =>
        text ? (
          <img src={text} alt="Poster" style={{ width: 60, height: 90 }} />
        ) : (
          "N/A"
        ),
    },
    {
      title: "Trạng thái",
      dataIndex: "isActive",
      render: (isActive) => (isActive ? "Hoạt động" : "Không"),
      sorter: true,
      align: "center",
    },
    {
      title: "Hành động",
      dataIndex: "actions",
      align:"center",
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
            cellPaddingInline:10
          },
          Select: {},
        },
      }}
    >
      <div>
        <Title level={4}>Quản lý phim</Title>
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
            Thêm phim mới
          </Button>
        </Flex>
        <br />
        <Table
          columns={columns}
          rowKey={(record) => record.id}
          dataSource={movies}
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
        title={editingMovie ? "Chỉnh sửa phim" : "Thêm mới phim"}
        onCancel={handleCancel}
        footer={null}
        destroyOnClose
        forceRender
        style={{
          top: "10px",
        }}
        width={"1000px"}
      >
        <Form form={movieForm} layout="vertical" onFinish={handleFinish}>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="title"
                label="Tiêu đề"
                rules={[
                  { required: true, message: "Vui lòng nhập tiêu đề phim" },
                ]}
              >
                <Input placeholder="Nhập tiêu đề phim" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="director"
                label="Đạo diễn"
                rules={[
                  { required: true, message: "Vui lòng nhập tên đạo diễn" },
                ]}
              >
                <Input placeholder="Nhập tên đạo diễn" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="cast"
                label="Diễn viên"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập danh sách diễn viên",
                  },
                ]}
              >
                <Input placeholder="Nhập danh sách diễn viên" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="genre"
                label="Thể loại"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng chọn ít nhất một thể loại",
                  },
                ]}
              >
                <Select
                  mode="multiple"
                  placeholder="Chọn thể loại"
                  allowClear
                  options={genreOptions} // Sử dụng options từ mảng
                  optionFilterProp="label" // Tìm kiếm theo label
                />
              </Form.Item>
            </Col>

            <Col span={8}>
              <Form.Item
                name="ageRating"
                label="Độ tuổi"
                rules={[
                  { required: true, message: "Vui lòng chọn đánh giá độ tuổi" },
                ]}
              >
                <Select placeholder="Chọn đánh giá độ tuổi">
                  <Option value="G">G</Option>
                  <Option value="PG">PG</Option>
                  <Option value="PG-13">PG-13</Option>
                  <Option value="R">R</Option>
                  <Option value="NC-17">NC-17</Option>
                </Select>
              </Form.Item>
            </Col>

            <Col span={8}>
              <Form.Item
                name="duration"
                label="Thời lượng (phút)"
                rules={[
                  { required: true, message: "Vui lòng nhập thời lượng" },
                  {
                    type: "number",
                    min: 1,
                    message: "Thời lượng phải tối thiểu 1 phút",
                  },
                ]}
              >
                <InputNumber
                  min={1}
                  placeholder="Nhập thời lượng (phút)"
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="releaseDate"
                label="Ngày phát hành"
                rules={[
                  { required: true, message: "Vui lòng chọn ngày phát hành" },
                ]}
              >
                <DatePicker format="DD-MM-YYYY" style={{ width: "100%" }} />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="trailer"
                label="URL trailer"
                rules={[
                  { required: true, message: "Vui lòng nhập URL trailer" },
                  { type: "url", message: "Vui lòng nhập một URL hợp lệ" },
                ]}
              >
                <Input placeholder="Nhập URL trailer" />
              </Form.Item>
            </Col>

            <Col span={4}>
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

          <Form.Item
            name="description"
            label="Mô tả"
            rules={[{ required: true, message: "Vui lòng nhập mô tả" }]}
          >
            <TextArea rows={4} placeholder="Nhập mô tả phim" />
          </Form.Item>

          <Form.Item name="poster" label="Ảnh">
            <Upload
              listType="picture"
              beforeUpload={() => false} // Prevent automatic upload
              maxCount={1}
              accept="image/*"
              fileList={posterFileList} // Dùng state posterFileList để quản lý
              onChange={handlePosterChange} // Gọi hàm handlePosterChange khi có file mới
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

export default ManageMovie;
