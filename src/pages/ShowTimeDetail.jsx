import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Row, Col, Card, Space, Typography, message, Flex, Button } from "antd";
import showtimeApi from "../api/showtimeApi";
import dayjs from "dayjs";
import { useSelector } from "react-redux";
import paymentApi from "../api/paymentApi";

const { Title, Paragraph } = Typography;

const ShowTimeDetail = () => {
  const { showtimeId } = useParams();
  const [showtimeDetails, setShowtimeDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSeats, setSelectedSeats] = useState([]);

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
    console.log(selectedSeats);

    if (seat.showSeatStatus === "AVAILABLE") {
      setSelectedSeats((prev) => {
        if (prev.includes(seat.id)) {
          return prev.filter((id) => id !== seat.id); // Bỏ chọn ghế nếu đã chọn
        }
        return [...prev, seat.id]; // Thêm ghế vào danh sách đã chọn
      });
    }
  };

    const handleContinue = async () => {
      try {
        const totalPrice = calculateTotalPrice();
        const bookingRequest = {
          userId: user.id, // Thay bằng userId thật nếu cần
          totalPrice: totalPrice,
          bookingDate: dayjs().toISOString(),
          showtimeId: showtimeId,
          listShowSeatId: selectedSeats,
          listShowSeatNumber: selectedSeats
            .map((seatId) => {
              const seat = showSeatResponseList.find((s) => s.id === seatId);
              return seat ? `${seat.seatRow}${seat.number}` : "";
            })
            .join(", "),
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
        console.log(error);
        
        message.error("An error occurred while processing payment");
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

  // Hàm tính tổng tiền cho ghế đã chọn
  const calculateTotalPrice = () => {
    return showSeatResponseList.reduce((total, seat) => {
      if (selectedSeats.includes(seat.id)) {
        return total + seat.price; // Cộng dồn giá của ghế đã chọn
      }
      return total;
    }, 0);
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
    <div
      style={{ minHeight: 600, padding: "20px 70px", background: "#f9f9f9" }}
    >
      <Row gutter={[16, 16]}>
        <Col span={16}>
          <Card style={{ borderTop: "5px solid orange", textAlign: "center" }}>
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
                <div>
                  -----------------------------------------------------------------------
                </div>
                <Flex justify="space-between" style={{ fontWeight: "bold" }}>
                  <div>Tổng cộng</div>
                  <div>{calculateTotalPrice().toLocaleString()} ₫</div>
                </Flex>
                <Flex justify="space-between" style={{ marginTop: "10px" }}>
                  <Button>Trở lại</Button>
                  <Button type="primary" onClick={handleContinue}>
                    Tiếp tục
                  </Button>
                </Flex>
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ShowTimeDetail;
