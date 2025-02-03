import { Button, Col, Row, Spin, Typography, Space } from "antd";
import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import movieApi from "../api/movieApi";
import showtimeApi from "../api/showtimeApi";
import "../components/style/NowShowingHome.css";
import { useSelector } from "react-redux";

import { Card, message, Flex, Radio } from "antd";
import bookingApi from "../api/bookingApi";
import foodApi from "../api/foodApi";
import "./style/ScanQR.scss";
import { CheckCircleFilled } from "@ant-design/icons";

const { Title, Paragraph } = Typography;

const BookingTicketOffline = () => {
  const { user } = useSelector((state) => state.auth);
  const theaterId = user.theaterId;
  const [movies, setMovies] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [loadingMovies, setLoadingMovies] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [availableDates, setAvailableDates] = useState([]);
  const [showtimes, setShowtimes] = useState([]);
  const [selectedDate, setSelectedDate] = useState(dayjs().startOf("day"));
  const [bigStep, setBigStep] = useState(1); // State để quản lý hiển thị
  const [bookedData, setBookedData] = useState(null);

  const fetchMovies = async () => {
    try {
      setLoadingMovies(true);
      const data = await movieApi.getNowShowing();
      setMovies(data.result || []);
    } catch (error) {
      console.error("Error fetching movies:", error);
    } finally {
      setLoadingMovies(false);
    }
  };

  const fetchMovieDetails = async (movie) => {
    try {
      setLoadingDetails(true);
      setSelectedMovie(movie); // Cập nhật phim được chọn
      const response = await showtimeApi.getAvailableDates({
        movieId: movie.id,
      });
      setAvailableDates(response.result || []);

      // Tự động fetch suất chiếu của ngày đầu tiên nếu danh sách không rỗng
      if (response.result && response.result.length > 0) {
        const firstDate = dayjs(response.result[0].fullDate); // Ngày đầu tiên
        setSelectedDate(firstDate);
        await handleDateChange(firstDate, movie.id); // Gọi với movie.id
      }
      setBigStep(2); // Chuyển sang bước chi tiết phim
    } catch (error) {
      console.error("Error fetching movie details:", error);
    } finally {
      setLoadingDetails(false);
    }
  };

  // Fetch lịch chiếu theo ngày
  const handleDateChange = async (date, movieId = selectedMovie.id) => {
    try {
      setSelectedDate(date);
      const response = await showtimeApi.getShowtimesForUser({
        movieId: movieId,
        date: dayjs(date).format("YYYY-MM-DD"),
      });
      // Lọc suất chiếu theo theaterId của user
      const filteredShowtimes = response.result.filter(
        (theater) => theater.theaterId === theaterId
      );

      setShowtimes(filteredShowtimes || []); // Chỉ hiển thị suất chiếu của theaterId của user
    } catch (error) {
      console.error("Error fetching showtimes:", error);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, []);

  const [showtimeId, setShowtimeId] = useState(null);
  const [showtimeDetails, setShowtimeDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [selectedFoods, setSelectedFoods] = useState([]);
  const [listFoods, setListFoods] = useState([]);
  const [step, setStep] = useState("selectSeat");

  const handleShowtimeSelect = (id) => {
    setShowtimeId(id); // Update the selected showtime ID
    setBigStep(3);
  };

  useEffect(() => {
    if (showtimeId != null) {
      setLoading(true); // Bắt đầu loading
      showtimeApi
        .getSelectShowtime(showtimeId)
        .then((response) => {
          console.log(response.result);

          setShowtimeDetails(response.result || {});
          setLoading(false); // Kết thúc loading
        })
        .catch((error) => {
          message.error("Error fetching showtime details");
          setLoading(false); // Kết thúc loading dù có lỗi
        });
    }
  }, [showtimeId]);

  const {
    movieTitle,
    moviePoster,
    roomTypeName,
    ageRating,
    theaterName,
    roomName,
    date,
    timeStart,
    showSeatResponseList,
  } = showtimeDetails || {}; // Nếu null, sử dụng đối tượng rỗng để tránh lỗi

  // Hàm xác định màu viền theo loại ghế
  const getBorderColorBySeatType = (seatTypeName) => {
    switch (seatTypeName) {
      case "VIP":
        return "gold";
      case "STANDARD":
        return "gray";
      case "COUPLE":
        return "purple";
      default:
        return "black";
    }
  };

  // Hàm xác định màu nền theo trạng thái ghế
  const getBackgroundColorBySeatStatus = (seat) => {
    if (selectedSeats.includes(seat.id)) {
      return "orange"; // Màu cho ghế đã chọn
    }
    switch (seat.showSeatStatus) {
      case "AVAILABLE":
        return "white";
      case "BOOKED":
        return "lightgray";
      case "SELECTED":
        return "red";
    }
  };

  // Hàm xử lý chọn ghế
  const handleSeatSelect = (seat) => {
    if (seat.showSeatStatus === "AVAILABLE") {
      setSelectedSeats((prev) => {
        if (prev.includes(seat.id)) {
          return prev.filter((id) => id !== seat.id); // Bỏ chọn ghế nếu đã chọn
        }
        return [...prev, seat.id]; // Thêm ghế vào danh sách đã chọn
      });
    }
  };

  const handleBook = async () => {
    try {
      const totalPrice = calculateTotalPrice();
      const bookingRequest = {
        userId: user.id, // Thay bằng userId thật nếu cần
        totalPrice: totalPrice,
        showtimeId: showtimeId,
        listShowSeatId: selectedSeats,
        listShowSeatNumber: selectedSeats
          .map((seatId) => {
            const seat = showSeatResponseList.find((s) => s.id === seatId);
            return seat ? `${seat.seatRow}${seat.number}` : "";
          })
          .join(", "),
        foodBookingRequestList: selectedFoods.map((item) => {
          const { id, quantity } = item;
          return { foodId: id, quantity: quantity };
        }),
      };

      console.log(bookingRequest);

      const response = await bookingApi.bookOff(bookingRequest);
      console.log(response.result);

      if (response && response.result) {
        setBookedData(response.result);
        setBigStep(4);
      } else {
        message.error("Failed to initiate payment");
      }
    } catch (error) {
      console.log(error);

      message.error(error.response?.data?.message || "Có lỗi xảy ra.");
      // setTimeout(() => {
      //   window.location.reload();
      // }, 2000);
    }
  };

  const handleContinue = async () => {
    try {
      setLoading(true);
      const res = await foodApi.getAllForUser();
      setListFoods(res.result);
      console.log(res.result);
      setStep("selectFood");
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const getSelectedSeatsByType = () => {
    const seatGroups = {};

    selectedSeats.forEach((seatId) => {
      const seat = showSeatResponseList.find((s) => s.id === seatId);
      if (seat) {
        const { seatTypeName, price, seatRow, number } = seat;
        if (!seatGroups[seatTypeName]) {
          seatGroups[seatTypeName] = { seats: [], totalPrice: 0, price };
        }
        seatGroups[seatTypeName].seats.push(`${seatRow}${number}`); // Ghép seatRow và number
        seatGroups[seatTypeName].totalPrice += price;
      }
    });

    return seatGroups;
  };

  const handleFoodSelect = (foodId, action) => {
    console.log(selectedFoods);

    setSelectedFoods((prev) => {
      const food = prev.find((item) => item.id === foodId);
      if (food) {
        const updatedQuantity =
          action === "increase" ? food.quantity + 1 : food.quantity - 1;
        return prev
          .map((item) =>
            item.id === foodId
              ? { ...item, quantity: Math.max(updatedQuantity, 0) }
              : item
          )
          .filter((item) => item.quantity > 0); // Lọc các item có quantity > 0
      } else if (action === "increase") {
        const food = listFoods.find((item) => item.id === foodId);
        return [...prev, { ...food, quantity: 1 }];
      }
      return prev;
    });
  };

  const calculateTotalPrice = () => {
    const seatTotal = showSeatResponseList.reduce((total, seat) => {
      if (selectedSeats.includes(seat.id)) {
        return total + seat.price;
      }
      return total;
    }, 0);

    const foodTotal = selectedFoods.reduce(
      (total, food) => total + food.price * food.quantity,
      0
    );

    return seatTotal + foodTotal;
  };

  // Hàm render sơ đồ ghế
  const renderSeatMap = () => {
    const groupedSeats = showSeatResponseList.reduce((acc, seat) => {
      if (!acc[seat.seatRow]) {
        acc[seat.seatRow] = [];
      }
      acc[seat.seatRow].push(seat);
      return acc;
    }, {});

    return Object.keys(groupedSeats).map((seatRow) => (
      <div
        key={seatRow}
        style={{
          marginBottom: "10px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span
          style={{
            marginRight: "10px",
            fontWeight: "bold",
            width: "20px",
            display: "inline-block",
          }}
        >
          {seatRow}
        </span>
        <Space>
          {groupedSeats[seatRow].map((seat) => (
            <div
              key={seat.id}
              onClick={() => handleSeatSelect(seat)}
              style={{
                border: `2px solid ${getBorderColorBySeatType(
                  seat.seatTypeName
                )}`,
                backgroundColor: getBackgroundColorBySeatStatus(seat),
                margin: "5px",
                width: "24px",
                height: "24px",
                lineHeight: "24px",
                textAlign: "center",
                borderRadius: "4px",
                cursor:
                  seat.showSeatStatus === "AVAILABLE"
                    ? "pointer"
                    : "not-allowed",
              }}
            >
              {seat.number}
            </div>
          ))}
        </Space>
        <span
          style={{
            marginLeft: "10px",
            fontWeight: "bold",
            width: "20px",
            display: "inline-block",
          }}
        >
          {seatRow}
        </span>
      </div>
    ));
  };

  // Hàm render các biểu tượng minh họa cho loại ghế và trạng thái ghế
  const renderSeatLegend = () => (
    <Flex justify="space-between" style={{ marginTop: "20px" }}>
      <Space>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              backgroundColor: "lightgray",
              display: "inline-block",
              width: "20px",
              height: "20px",
              borderRadius: "4px",
            }}
          />
          <div>Ghế đã bán</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              backgroundColor: "orange",
              display: "inline-block",
              width: "20px",
              height: "20px",
              borderRadius: "4px",
            }}
          />
          <div>Ghế đang chọn</div>
        </div>
      </Space>

      <Space>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              border: "2px solid gold",
              display: "inline-block",
              width: "20px",
              height: "20px",
              borderRadius: "4px",
            }}
          />
          <div>Ghế VIP</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              border: "2px solid gray",
              display: "inline-block",
              width: "20px",
              height: "20px",
              borderRadius: "4px",
            }}
          />
          <div>Ghế Thường</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              border: "2px solid purple",
              display: "inline-block",
              width: "20px",
              height: "20px",
              borderRadius: "4px",
            }}
          />
          <div>Ghế Đôi</div>
        </div>
      </Space>
    </Flex>
  );

  return (
    <div style={{ minHeight: 600, padding: "0px 40px", background: "white" }}>
      {bigStep === 1 && (
        <>
          <Row gutter={[40, 40]}>
            {loadingMovies ? (
              <Spin size="large" />
            ) : movies.length > 0 ? (
              movies.map((movie) => (
                <Col key={movie.id} xs={24} sm={12} md={12} lg={6}>
                  <div
                    style={{ cursor: "pointer" }}
                    onClick={() => fetchMovieDetails(movie)}
                  >
                    <img
                      alt={movie.title}
                      src={movie.poster}
                      width={"100%"}
                      style={{ borderRadius: "15px" }}
                    />
                    <Title
                      style={{
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        width: "100%",
                      }}
                      level={5}
                    >
                      {movie.title}
                    </Title>
                    <Button type="primary" block>
                      Chi tiết
                    </Button>
                  </div>
                </Col>
              ))
            ) : (
              <p>Không có phim nào.</p>
            )}
          </Row>
        </>
      )}

      {bigStep === 2 && selectedMovie && (
        <div style={{ marginTop: 0 }}>
          <Button
            onClick={() => {
              // Reset dữ liệu khi quay lại danh sách phim
              setBigStep(1);
              setSelectedMovie(null); // Reset phim đã chọn
              setAvailableDates([]); // Reset ngày có suất chiếu
              setShowtimes([]); // Reset danh sách suất chiếu
              setSelectedDate(dayjs().startOf("day")); // Đặt lại ngày mặc định
            }}
            style={{ marginBottom: 20 }}
          >
            Quay lại danh sách phim
          </Button>
          <Spin spinning={loadingDetails}>
            <Row gutter={[50, 50]}>
              <Col span={8}>
                <img
                  src={selectedMovie.poster}
                  alt=""
                  width={"100%"}
                  style={{ objectFit: "cover", borderRadius: "30px" }}
                />
              </Col>
              <Col span={16}>
                <Title level={2}>{selectedMovie.title}</Title>
                <Title level={3} style={{ marginTop: 20 }}>
                  Lịch chiếu
                </Title>
                <Space>
                  {availableDates.map((date) => (
                    <Button
                      key={date.fullDate}
                      type={
                        selectedDate.isSame(dayjs(date.fullDate), "day")
                          ? "primary"
                          : "default"
                      }
                      onClick={() => handleDateChange(dayjs(date.fullDate))}
                    >
                      {date.date} ({date.dayOfWeek})
                    </Button>
                  ))}
                </Space>

                {showtimes.length > 0 ? (
                  <div style={{ marginTop: 20 }}>
                    {showtimes.map((theater) => (
                      <div key={theater.theaterId}>
                        {theater.showtimeByRoomTypeList.map((roomType) => (
                          <div key={roomType.roomTypeId}>
                            <Paragraph>
                              Phòng chiếu {roomType.roomTypeName}:
                            </Paragraph>
                            <Space>
                              {roomType.showtimeByTimeResponseList.map(
                                (showtime) => (
                                  <Button
                                    key={showtime.id}
                                    type="default"
                                    onClick={() =>
                                      handleShowtimeSelect(showtime.id)
                                    }
                                  >
                                    {dayjs(
                                      showtime.timeStart,
                                      "HH:mm:ss"
                                    ).format("HH:mm")}
                                  </Button>
                                )
                              )}
                            </Space>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                ) : (
                  <Paragraph>Không có suất chiếu nào cho ngày này.</Paragraph>
                )}
              </Col>
            </Row>
          </Spin>
        </div>
      )}

      {bigStep === 3 && (
        <>
          <div
            style={{
              minHeight: 700,
              background: "#f9f9f9",
            }}
          >
            <Button
              onClick={() => {
                setBigStep(2);
                setShowtimeId(null);
                setShowtimeDetails(null);
                setSelectedSeats([]);
                setSelectedFoods([]);
                setStep("selectSeat");
                setListFoods([]);
              }}
              style={{ marginBottom: 20 }}
            >
              Trở về
            </Button>
            <Row gutter={[16, 16]}>
              <Col span={16}>
                {step == "selectSeat" ? (
                  <Card
                    style={{
                      borderTop: "5px solid orange",
                      textAlign: "center",
                    }}
                  >
                    <Flex justify="center">
                      <div
                        style={{
                          height: "5px",
                          backgroundColor: "green",
                          width: "80%",
                        }}
                      ></div>
                    </Flex>

                    <div
                      style={{
                        textAlign: "center",
                        margin: "10px",
                        color: "lightslategray",
                      }}
                    >
                      Màn hình
                    </div>
                    {showtimeDetails && renderSeatMap()}
                    {renderSeatLegend()}
                  </Card>
                ) : (
                  <div>
                    <Card>
                      <Title level={4}>Chọn combo</Title>
                      {listFoods.map((food) => (
                        <Flex
                          key={food.id}
                          gap={10}
                          style={{ marginBottom: "10px" }}
                        >
                          <img src={food.img} alt="" height={100} width={150} />
                          <div style={{ flex: 1 }}>
                            <h4
                              style={{
                                fontWeight: "bold",
                                marginBottom: "5px",
                              }}
                            >
                              {food.name}
                            </h4>
                            <div style={{ marginBottom: "5px" }}>
                              {food.description}
                            </div>
                            <Flex justify="space-between">
                              <div style={{ fontWeight: "bold" }}>
                                Giá: {food.price.toLocaleString()} đ
                              </div>
                              <Flex
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "10px",
                                }}
                              >
                                <button
                                  style={{
                                    backgroundColor: "#f0f0f0",
                                    border: "1px solid #ccc",
                                    borderRadius: "5px",
                                    padding: "5px 10px",
                                    fontSize: "16px",
                                    cursor: "pointer",
                                  }}
                                  onClick={() =>
                                    handleFoodSelect(food.id, "decrease")
                                  }
                                >
                                  -
                                </button>
                                <div
                                  style={{
                                    fontSize: "16px",
                                    fontWeight: "bold",
                                    color: "#333",
                                    width: "40px",
                                    textAlign: "center",
                                    border: "1px solid #ccc",
                                    borderRadius: "5px",
                                    backgroundColor: "#fafafa",
                                    padding: "5px 0",
                                  }}
                                >
                                  {selectedFoods.find(
                                    (item) => item.id === food.id
                                  )?.quantity || 0}
                                </div>
                                <button
                                  style={{
                                    backgroundColor: "#f0f0f0",
                                    border: "1px solid #ccc",
                                    borderRadius: "5px",
                                    padding: "5px 10px",
                                    fontSize: "16px",
                                    cursor: "pointer",
                                  }}
                                  onClick={() =>
                                    handleFoodSelect(food.id, "increase")
                                  }
                                >
                                  +
                                </button>
                              </Flex>
                            </Flex>
                          </div>
                        </Flex>
                      ))}
                    </Card>
                  </div>
                )}
              </Col>
              <Col span={8}>
                <Card style={{ borderTop: "5px solid orange" }}>
                  <Flex gap={10}>
                    <div>
                      <img
                        style={{ borderRadius: "8px" }}
                        width={150}
                        src={moviePoster}
                        alt=""
                      />
                    </div>
                    <div>
                      <Paragraph>
                        <strong>{movieTitle}</strong>
                      </Paragraph>
                      <Paragraph>
                        Phòng chiếu {roomTypeName} - {ageRating}
                      </Paragraph>
                    </div>
                  </Flex>
                  <Paragraph>
                    <strong>{theaterName}</strong> - {roomName}
                  </Paragraph>
                  <Paragraph>
                    Suất: <strong>{timeStart}</strong> -{" "}
                    <strong>{dayjs(date).format("DD/MM/YYYY")}</strong>
                  </Paragraph>

                  {selectedSeats?.length > 0 && (
                    <div>
                      <div>
                        -------------------------------------------------------------
                      </div>
                      <div>
                        {Object.entries(getSelectedSeatsByType()).map(
                          ([seatType, data]) => (
                            <div key={seatType} style={{ marginTop: "5px" }}>
                              <Flex justify="space-between">
                                <Paragraph style={{ margin: "0px" }}>
                                  <strong>{data.seats.length}x</strong> Ghế{" "}
                                  {seatType}
                                </Paragraph>
                                <div>
                                  <Paragraph style={{ margin: "0px" }}>
                                    <strong>
                                      {data.totalPrice.toLocaleString()} ₫
                                    </strong>
                                  </Paragraph>
                                </div>
                              </Flex>
                              <Paragraph style={{ margin: "0px" }}>
                                Ghế: <strong>{data.seats.join(", ")}</strong>
                              </Paragraph>{" "}
                              {/* Hiển thị cả seatRow và seatNumber */}
                            </div>
                          )
                        )}
                      </div>
                      {selectedFoods?.length > 0 && (
                        <div>
                          <div>
                            -------------------------------------------------------------
                          </div>
                          <div>
                            {selectedFoods.map((item) => {
                              let totalPrice = item.price * item.quantity;

                              return (
                                <div key={item.id} style={{ marginTop: "5px" }}>
                                  <Flex justify="space-between">
                                    <Paragraph style={{ margin: "0px" }}>
                                      <strong>{item.quantity}x</strong>{" "}
                                      {item.name}
                                    </Paragraph>
                                    <Paragraph style={{ margin: "0px" }}>
                                      <strong>
                                        {totalPrice.toLocaleString()} đ
                                      </strong>
                                    </Paragraph>
                                  </Flex>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                      <div>
                        -------------------------------------------------------------
                      </div>
                      <Flex
                        justify="space-between"
                        style={{ fontWeight: "bold" }}
                      >
                        <div>Tổng cộng</div>
                        <div>{calculateTotalPrice().toLocaleString()} ₫</div>
                      </Flex>
                      {step == "selectSeat" ? (
                        <Flex
                          justify="space-between"
                          style={{ marginTop: "10px" }}
                        >
                          <Button type="primary" onClick={handleContinue}>
                            Tiếp tục
                          </Button>
                        </Flex>
                      ) : (
                        <div>
                          <Flex
                            justify="space-between"
                            style={{ marginTop: "10px" }}
                          >
                            <Button onClick={() => setStep("selectSeat")}>
                              Trở lại
                            </Button>
                            <Button type="primary" onClick={handleBook}>
                              Đặt vé
                            </Button>
                          </Flex>
                        </div>
                      )}
                    </div>
                  )}
                </Card>
              </Col>
            </Row>
          </div>
        </>
      )}

      {bigStep === 4 && (
        <div>
          <Title style={{ textAlign: "center" }} level={3}>
            <CheckCircleFilled style={{ color: "#52c41a", fontSize: "30px" }} />
            {"  "}Đặt vé thành công
          </Title>
          {bookedData?.showSeatNumberList?.split(", ").map((seat, index) => (
            <div className="cardWrap" key={seat}>
              <div className="card cardLeft">
                <h1>
                  {/* NTH <span>Cinema</span> */}
                  {bookedData?.theaterName}
                </h1>
                <div className="title">
                  <h2>{bookedData?.movieTitle}</h2>
                </div>
                <div className="name">
                  <h2>{bookedData?.roomName}</h2>
                </div>
                <div className="seat">
                  <span>seat</span>
                  <h2>{seat}</h2>
                </div>
                <div className="time">
                  <span>time</span>
                  <h2>
                    {dayjs(bookedData?.timeStart, "HH:mm:ss").format("HH:mm") +
                      "  " +
                      bookedData?.date}
                  </h2>
                </div>
              </div>
              <div className="card cardRight">
                <div className="eye"></div>
                <div className="number">
                  <h3>{seat}</h3>
                  <span>seat</span>
                </div>
              </div>
            </div>
          ))}

          <div className="cardWrap">
            <div className="card cardLeft">
              <h1>
                {/* NTH <span>Cinema</span> */}
                {bookedData?.theaterName}
              </h1>
              <div>
                <ul className="title">
                  {bookedData?.foodBookingList.map((food, index) => (
                    <li key={food.foodName}>
                      <h2>{food.foodName + " x " + food.quantity}</h2>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="card cardRight">
              <div className="code">
                <h3>{bookedData?.bookingCode}</h3>
                <span>code</span>
              </div>
            </div>
          </div>

          <div className="cardWrap">
            <Button
              style={{ marginRight: "184px" }}
              onClick={() => window.location.reload()}
            >
              Trở về
            </Button>
            <Button type="primary">In vé</Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingTicketOffline;
