import {
  Button,
  DatePicker,
  Form,
  Modal,
  Select,
  Space,
  Table,
  TimePicker,
  message,
} from "antd";
import Title from "antd/es/typography/Title";
import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import theaterApi from "../api/theaterApi";
import showtimeApi from "../api/showtimeApi";
import movieApi from "../api/movieApi";
import { useSelector } from "react-redux";

const ManageShowing = () => {
  const { user } = useSelector((state) => state.auth);
  const [theaters, setTheaters] = useState([]);
  const [selectedTheater, setSelectedTheater] = useState();
  const [selectedDate, setSelectedDate] = useState();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [movies, setMovies] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState();
  const [isEditing, setIsEditing] = useState(false); // Kiểm tra xem có đang sửa không
  const [editingShowtime, setEditingShowtime] = useState(null); // Lưu suất chiếu đang được sửa
  const [form] = Form.useForm();

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

    const fetchMovies = async () => {
      try {
        const res = await movieApi.getAllActive();
        setMovies(res.result);
      } catch (error) {
        console.log(error);
      }
    };
    fetchMovies();
  }, [user.theaterId]); // Thêm dependency user.theaterId

  const handleConfirm = async () => {
    if (!selectedTheater || !selectedDate) {
      return;
    }
    setLoading(true);
    try {
      const res = await showtimeApi.getAll({
        theaterId: selectedTheater,
        date: selectedDate,
      });

      setData(res.result);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddShowtime = (roomId) => {
    setSelectedRoom(roomId);
    setIsEditing(false);
    setEditingShowtime(null);
    setModalVisible(true);
  };

  const handleEditShowtime = async (showtimeId) => {
    setIsEditing(true);
    const res = await showtimeApi.getById(showtimeId);
    setEditingShowtime(res.result);
    setModalVisible(true);
    form.setFieldsValue({
      movieId: res.result.movieId,
      timeStart: dayjs(res.result.timeStart, "HH:mm"),
      isActive: res.result.isActive,
    });
  };

  const handleCreateShowtime = async (values) => {
    try {
      if (isEditing && editingShowtime) {
        // Nếu đang sửa suất chiếu
        await showtimeApi.update(editingShowtime.id, {
          movieId: values.movieId,
          timeStart: values.timeStart.format("HH:mm"),
          isActive: values.isActive,
        });
        message.success("Cập nhật suất chiếu thành công!");
      } else {
        // Nếu là thêm suất chiếu mới
        await showtimeApi.create({
          theaterId: selectedTheater,
          roomId: selectedRoom,
          movieId: values.movieId,
          date: selectedDate,
          timeStart: values.timeStart.format("HH:mm"),
          isActive: values.isActive,
        });
        message.success("Thêm suất chiếu thành công!");
      }

      setModalVisible(false);
      form.resetFields();
      handleConfirm(); // Tải lại danh sách suất chiếu sau khi thêm hoặc cập nhật
    } catch (error) {
      console.log(error);
      message.error("Thời gian bị trùng với suất chiếu khác");
    }
  };

  const handleDeleteShowtime = async (id) => {
    try {
      await showtimeApi.delete(id);
      message.success("Xóa suất chiếu thành công!");
      handleConfirm(); // Tải lại danh sách sau khi xóa
    } catch (error) {
      console.log(error);
      message.error("Có lỗi xảy ra khi xóa!");
    }
  };

  const columns = [
    {
      title: "Tên phim",
      dataIndex: "movieTitle",
      key: "movieTitle",
      width: "20%",
    },
    {
      title: "Giờ bắt đầu",
      dataIndex: "timeStart",
      key: "timeStart",
      width: "20%",
    },
    {
      title: "Giờ kết thúc",
      dataIndex: "timeEnd",
      key: "timeEnd",
      width: "20%",
    },
    {
      title: "Trạng thái",
      dataIndex: "isActive",
      key: "isActive",
      width: "20%",
      render: (isActive) => (isActive ? "Hoạt động" : "Không hoạt động"),
    },
    {
      title: "Hành động",
      key: "actions",
      width: "20%",
      render: (record) => (
        <Space>
          <Button type="link" onClick={() => handleEditShowtime(record.id)}>
            Cập nhật
          </Button>
          <Button
            type="link"
            danger
            onClick={() => handleDeleteShowtime(record.id)}
          >
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ height: "82vh", overflow: "auto" }}>
      <Title level={4}>Quản lý suất chiếu</Title>
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

        <DatePicker
          style={{ width: 200 }}
          onChange={(date, dateString) => setSelectedDate(dateString)}
          placeholder="Chọn ngày"
        />

        <Button type="primary" onClick={handleConfirm}>
          Xác nhận
        </Button>
      </Space>

      {/* {data.length == 0 && (
        <Title style={{ marginTop: "30px" }} level={5}>
          Chưa có phòng nào
        </Title>
      )} */}
      {data.map((room) => (
        <div key={room.roomResponse.id} style={{ marginTop: "20px" }}>
          <Title level={5}>
            {room.roomResponse.name} - {room.roomResponse.roomTypeName}
          </Title>
          <Table
            columns={columns}
            dataSource={room.showtimeResponseList}
            rowKey={(record) => record.id}
            loading={loading}
            pagination={false} // Không phân trang
          />
          <Button
            type="primary"
            style={{ marginTop: "10px" }}
            onClick={() => handleAddShowtime(room.roomResponse.id)}
          >
            Thêm suất chiếu
          </Button>
        </div>
      ))}

      {/* Modal thêm/cập nhật suất chiếu */}
      <Modal
        title={
          isEditing
            ? "Cập nhật suất chiếu"
            : `Thêm suất chiếu tại ${
                data.find((room) => room.roomResponse.id === selectedRoom)
                  ?.roomResponse.name || ""
              } ${
                theaters.find((theater) => theater.id === selectedTheater)
                  ?.name || ""
              } `
        }
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        footer={null}
      >
        <Form form={form} onFinish={handleCreateShowtime}>
          <Form.Item
            label="Phim"
            name="movieId"
            rules={[{ required: true, message: "Vui lòng chọn phim!" }]}
          >
            <Select
              placeholder="Chọn phim"
              optionFilterProp="children"
              showSearch
            >
              {movies.map((movie) => (
                <Select.Option key={movie.id} value={movie.id}>
                  {movie.title}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Giờ bắt đầu"
            name="timeStart"
            rules={[{ required: true, message: "Vui lòng chọn giờ bắt đầu!" }]}
          >
            <TimePicker use12Hours format="HH:mm" />
          </Form.Item>

          <Form.Item
            label="Trạng thái"
            name="isActive"
            rules={[{ required: true, message: "Vui lòng chọn trạng thái!" }]}
          >
            <Select placeholder="Chọn trạng thái">
              <Select.Option value={true}>Hoạt động</Select.Option>
              <Select.Option value={false}>Không hoạt động</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              {isEditing ? "Cập nhật" : "Thêm"}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ManageShowing;
