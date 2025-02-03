import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Row, Col, Card, Space, Typography, message, Flex, Button, Radio } from "antd";
import showtimeApi from "../api/showtimeApi";
import dayjs from "dayjs";
import { useSelector } from "react-redux";
import paymentApi from "../api/paymentApi";
import foodApi from "../api/foodApi";

const { Title, Paragraph } = Typography;

const ShowTimeDetail = () => {
  const { showtimeId } = useParams();
  const [showtimeDetails, setShowtimeDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [selectedFoods, setSelectedFoods] = useState([]);
  const [listFoods, setListFoods] = useState([]);
  const [step, setStep] = useState("selectSeat");
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    showtimeApi
      .getSelectShowtime(showtimeId)
      .then((response) => {
        setShowtimeDetails(response.result);
        setLoading(false);
      })
      .catch((error) => {
        message.error("Error fetching showtime details");
        setLoading(false);
      });
  }, [showtimeId]);

  if (loading) return <p>Loading...</p>;
  if (!showtimeDetails) return <p>No data available.</p>;

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
  } = showtimeDetails;

  // Hàm xác định màu viền theo loại ghế
  const getBorderColorBySeatType = (seatTypeName) => {
    switch (seatTypeName) {
      case "VIP":
        return "blue";
      case "STANDARD":
        return "#01c73c";
      case "COUPLE":
        return "#ff62b0";
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

      const response = await paymentApi.createVnPayPayment(bookingRequest);
      console.log(response.result.paymentUrl);

      if (response && response.result.paymentUrl) {
        window.location.href = response.result.paymentUrl; // Redirect to payment URL
      } else {
        message.error("Failed to initiate payment");
      }
    } catch (error) {
      message.error(error.response?.data?.message || "Có lỗi xảy ra.");
      setTimeout(() => {
        window.location.reload();
      }, 2000);
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
              border: "2px solid blue",
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
              border: "2px solid #01c73c",
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
              border: "2px solid #ff62b0",
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
    <div
      style={{ minHeight: 700, padding: "20px 70px", background: "#f9f9f9" }}
    >
      <Row gutter={[16, 16]}>
        <Col span={16}>
          {step == "selectSeat" ? (
            <Card
              style={{ borderTop: "5px solid orange", textAlign: "center" }}
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
              {renderSeatMap()}
              {renderSeatLegend()}
            </Card>
          ) : (
            <div>
              <Card>
                <Title level={4}>Chọn combo</Title>
                {listFoods.map((food) => (
                  <Flex key={food.id} gap={10} style={{ marginBottom: "10px" }}>
                    <img src={food.img} alt="" height={100} width={150} />
                    <div style={{ flex: 1 }}>
                      <h4 style={{ fontWeight: "bold", marginBottom: "5px" }}>
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
                            {selectedFoods.find((item) => item.id === food.id)
                              ?.quantity || 0}
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
              <Card style={{ marginTop: "10px" }}>
                <Title level={4}>Chọn phương thức thanh toán</Title>
                <Radio.Group value={1}>
                  <Space direction="vertical">
                    <Radio value={1}>
                      <Space>
                        <img
                          height={100}
                          src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTp1v7T287-ikP1m7dEUbs2n1SbbLEqkMd1ZA&s"
                          alt=""
                        />
                        <p style={{ fontWeight: "bold" }}>Ví điện tử VNPay</p>
                      </Space>
                    </Radio>
                  </Space>
                </Radio.Group>
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
                  -----------------------------------------------------------------------
                </div>
                <div>
                  {Object.entries(getSelectedSeatsByType()).map(
                    ([seatType, data]) => (
                      <div key={seatType} style={{ marginTop: "5px" }}>
                        <Flex justify="space-between">
                          <Paragraph style={{ margin: "0px" }}>
                            <strong>{data.seats.length}x</strong> Ghế {seatType}
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
                      -----------------------------------------------------------------------
                    </div>
                    <div>
                      {selectedFoods.map((item) => {
                        let totalPrice = item.price * item.quantity;

                        return (
                          <div key={item.id} style={{ marginTop: "5px" }}>
                            <Flex justify="space-between">
                              <Paragraph style={{ margin: "0px" }}>
                                <strong>{item.quantity}x</strong> {item.name}
                              </Paragraph>
                              <Paragraph style={{ margin: "0px" }}>
                                <strong>{totalPrice.toLocaleString()} đ</strong>
                              </Paragraph>
                            </Flex>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                <div>
                  -----------------------------------------------------------------------
                </div>
                <Flex justify="space-between" style={{ fontWeight: "bold" }}>
                  <div>Tổng cộng</div>
                  <div>{calculateTotalPrice().toLocaleString()} ₫</div>
                </Flex>
                {step == "selectSeat" ? (
                  <Flex justify="flex-end" style={{ marginTop: "10px" }}>
                    <Button type="primary" onClick={handleContinue}>
                      Tiếp tục
                    </Button>
                  </Flex>
                ) : (
                  <div>
                    <Flex justify="space-between" style={{ marginTop: "10px" }}>
                      <Button onClick={() => setStep("selectSeat")}>
                        Trở lại
                      </Button>
                      <Button type="primary" onClick={handleBook}>
                        Đặt vé
                      </Button>
                    </Flex>
                    <p
                      style={{
                        borderTop: "2px solid lightgray",
                        marginTop: "10px",
                        paddingTop: "5px",
                        fontWeight: "bold",
                      }}
                    >
                      <span style={{ color: "red" }}>*</span>Vui lòng kiểm tra
                      thông tin đầy đủ trước khi qua bấm đặt vé.
                      <br />
                      <span style={{ color: "red" }}>*</span>Vé mua rồi không
                      hoàn trả lại dưới mọi hình thức.
                    </p>
                  </div>
                )}
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ShowTimeDetail;
