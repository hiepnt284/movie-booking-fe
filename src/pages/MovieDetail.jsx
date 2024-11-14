import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import movieApi from "../api/movieApi";
import { Button, Row, Col, Space, Flex } from "antd";
import Title from "antd/es/typography/Title";
import Paragraph from "antd/es/typography/Paragraph";
import showtimeApi from "../api/showtimeApi";
import dayjs from "dayjs";
import { useDispatch, useSelector } from "react-redux";
import { MODAL_TYPES } from "../store/modalTypes";
import { openModal } from "../store/slices/modalSlice";

const MovieDetail = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const { movieId } = useParams();
  const [movie, setMovie] = useState();
  const [showtimes, setShowtimes] = useState([]);
  const [availableDates, setAvailableDates] = useState([]); // Danh sách ngày có suất chiếu
  const [selectedDate, setSelectedDate] = useState(dayjs().startOf("day")); // Ngày được chọn
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate()

  useEffect(() => {
    // Fetch movie details
    movieApi
      .get(movieId)
      .then((data) => {
        setMovie(data.result); // Cập nhật state với thông tin phim
        setLoading(false); // Đã tải xong
      })
      .catch((error) => {
        setError(error); // Cập nhật state với lỗi
        setLoading(false); // Đã tải xong dù có lỗi
      });

    // Fetch available dates for the movie
    showtimeApi
      .getAvailableDates({ movieId: movieId })
      .then((response) => {
        setAvailableDates(response.result); // Cập nhật danh sách ngày có suất chiếu

        if (response.result.length > 0) {
          // Mặc định chọn ngày đầu tiên trong danh sách lọc
          handleDateChange(dayjs(response.result[0].fullDate));
        }
      })
      .catch((error) => {
        console.log("Error fetching available dates:", error);
      });
  }, [movieId]);

  const handleDateChange = (date) => {
    setSelectedDate(date);
    if (date) {
      // Gọi API với movieId và date
      showtimeApi
        .getShowtimesForUser({
          movieId: movieId,
          date: dayjs(date).format("YYYY-MM-DD"), // Định dạng ngày theo 'YYYY-MM-DD'
        })
        .then((response) => {
          setShowtimes(response.result); // Cập nhật danh sách lịch chiếu
        })
        .catch((error) => {
          console.error("Error fetching showtimes:", error);
        });
    }
  };

  const handleClick = (id) => {
    if (!user) {
      // Nếu chưa đăng nhập, chuyển hướng tới trang đăng nhập
      dispatch(openModal({ modalType: MODAL_TYPES.LOGIN }));
    } else {
      navigate(`/showtime/${id}`);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Đã có lỗi xảy ra: {error.message}</p>;

  return (
    <div
      style={{ minHeight: 600, padding: "20px 140px", background: "white" }}
    >
      <Row gutter={[50, 50]}>
        <Col span={8}>
          <img
            src={movie.poster}
            alt=""
            width={"100%"}
            style={{ objectFit: "cover", borderRadius: "30px" }}
          />
        </Col>
        <Col span={16}>
          <Title level={2}>{movie.title}</Title>
          <Paragraph style={{ fontSize: "18px" }}>
            {movie.description}
          </Paragraph>
          <Paragraph style={{ fontSize: "18px" }}>
            <strong>PHÂN LOẠI:</strong> {movie.ageRating}
          </Paragraph>
          <Paragraph style={{ fontSize: "18px" }}>
            <strong>ĐẠO DIỄN:</strong> {movie.director}
          </Paragraph>
          <Paragraph style={{ fontSize: "18px" }}>
            <strong>DIỄN VIÊN:</strong> {movie.cast}
          </Paragraph>
          <Paragraph style={{ fontSize: "18px" }}>
            <strong>THỂ LOẠI:</strong> {movie.genre}
          </Paragraph>
          <Paragraph style={{ fontSize: "18px" }}>
            <strong>KHỞI CHIẾU:</strong> {movie.releaseDate}
          </Paragraph>
          <Paragraph style={{ fontSize: "18px" }}>
            <strong>THỜI LƯỢNG:</strong> {movie.duration} phút
          </Paragraph>
        </Col>
      </Row>

      <br />
      <Title
        level={3}
        style={{
          display: "inline",
          borderLeft: "5px solid #034ea2",
          paddingLeft: 5,
        }}
      >
        Lịch chiếu
      </Title>

      <div style={{ marginTop: 20 }}>
        <Space>
          {availableDates.map((date) => (
            <Button
              size="large"
              key={date.fullDate}
              type={
                selectedDate.isSame(dayjs(date.fullDate), "day")
                  ? "primary"
                  : "text"
              }
              onClick={() => handleDateChange(dayjs(date.fullDate))}
            >
              {date.date} ({date.dayOfWeek})
            </Button>
          ))}
        </Space>
      </div>

      {showtimes.length > 0 ? (
        <div style={{ marginTop: 20 }}>
          {showtimes.map((theater) => (
            <div
              key={theater.theaterId}
              style={{
                paddingBottom: "10px",
                borderBottom: "2px solid lightgray",
              }}
            >
              <Title style={{ marginTop: "10px" }} level={4}>
                {theater.theaterName}
              </Title>
              <Flex vertical gap={10}>
                {theater.showtimeByRoomTypeList.map((roomType) => (
                  <Flex gap={10} key={roomType.roomTypeId} align="center">
                    <Paragraph style={{ width: "150px", fontSize:"18px", marginBottom:0 }}>
                      Phòng chiếu {roomType.roomTypeName}
                    </Paragraph>
                    <ul style={{ display: "flex", gap: "10px" }}>
                      {roomType.showtimeByTimeResponseList.map((showtime) => (
                        <Button
                          key={showtime.id}
                          type="default"
                          size="large"
                          onClick={() => handleClick(showtime.id)}
                        >
                          {dayjs(showtime.timeStart, "HH:mm:ss").format(
                            "HH:mm"
                          )}
                        </Button>
                      ))}
                    </ul>
                  </Flex>
                ))}
              </Flex>
            </div>
          ))}
        </div>
      ) : (
        <Title style={{ marginTop: "20px" }} level={5}>
          Không có suất chiếu nào. Vui lòng chọn ngày khác
        </Title>
      )}
      <Title
        level={3}
        style={{
          display: "inline-block",
          borderLeft: "5px solid #034ea2",
          paddingLeft: 5,
          marginTop: "10px",
        }}
      >
        Trailer
      </Title>
      <iframe
        width="100%"
        src={movie.trailer.replace("watch?v=", "embed/")}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        title="YouTube video player"
        style={{ aspectRatio: 16 / 9, marginTop: "20px" }}
      ></iframe>
    </div>
  );
};

export default MovieDetail;
