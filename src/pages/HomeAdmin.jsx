import React, { useState, useEffect } from "react";
import { Bar } from "react-chartjs-2";
import {
  Select,
  DatePicker,
  message,
  Table,
  Tabs,
  Flex,
  ConfigProvider,
} from "antd";
import dayjs from "dayjs";
import theaterApi from "../api/theaterApi";
import statApi from "../api/statApi";
import { useSelector } from "react-redux"; // Sử dụng Redux để lấy thông tin user
import { Typography } from "antd"; // Import Typography từ Ant Design
const { Title: AntTitle } = Typography; // Đổi tên Title từ Ant Design

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const { Option } = Select;
const { TabPane } = Tabs;

const HomeAdmin = () => {
  const { user } = useSelector((state) => state.auth); // Lấy thông tin user từ Redux
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [],
  });
  const [timeFilter, setTimeFilter] = useState("daily"); // 'daily', 'monthly', 'yearly'
  const [month, setMonth] = useState(dayjs().month() + 1);
  const [year, setYear] = useState(dayjs().year());
  const [theaterId, setTheaterId] = useState(user.theaterId); // Gán mặc định theo quyền user
  const [theaters, setTheaters] = useState([]);

  const [movieStats, setMovieStats] = useState([]); // Dữ liệu thống kê phim

  // Lấy danh sách rạp
  const fetchTheaters = async () => {
    try {
      const response = await theaterApi.getAllForUser();
      const allTheaters = response.result;

      // Nếu user là admin (theaterId === null), lấy toàn bộ rạp
      if (user.theaterId === null) {
        setTheaters(allTheaters);
      } else {
        // User thường chỉ xem được rạp theo theaterId
        const filteredTheater = allTheaters.filter(
          (theater) => theater.id === user.theaterId
        );
        setTheaters(filteredTheater);
      }
    } catch (error) {
      console.error("Lỗi khi lấy danh sách rạp:", error);
      message.error("Không thể lấy danh sách rạp");
    }
  };

  // Lấy dữ liệu biểu đồ
  const fetchData = async () => {
    try {
      let response;

      if (timeFilter === "daily") {
        response = await statApi.getDailyRevenue({ month, year, theaterId });
      } else if (timeFilter === "monthly") {
        response = await statApi.getMonthlyRevenue({ year, theaterId });
      } else if (timeFilter === "yearly") {
        response = await statApi.getYearlyRevenue({ theaterId });
      }

      if (response) {
        let labels = [];
        let values = [];

        if (timeFilter === "daily") {
          const daysInMonth = dayjs(`${year}-${month}`).daysInMonth();
          for (let i = 1; i <= daysInMonth; i++) {
            const dateKey = `${year}-${month.toString().padStart(2, "0")}-${i
              .toString()
              .padStart(2, "0")}`;
            labels.push(i.toString()); // Chỉ hiển thị ngày
            values.push(response[dateKey] || 0);
          }
        } else if (timeFilter === "monthly") {
          for (let i = 1; i <= 12; i++) {
            const monthKey = i.toString();
            labels.push(`Tháng ${i}`);
            values.push(response[monthKey] || 0);
          }
        } else if (timeFilter === "yearly") {
          for (const yearKey in response) {
            labels.push(`Năm ${yearKey}`);
            values.push(response[yearKey] || 0);
          }
        }

        setChartData({
          labels: labels,
          datasets: [
            {
              label: `Doanh thu ${
                theaters.find((theater) => theater.id === theaterId)?.name ||
                "toàn bộ rạp"
              } theo ${
                timeFilter === "daily"
                  ? `ngày trong Tháng ${month}, Năm ${year}`
                  : timeFilter === "monthly"
                  ? `tháng trong Năm ${year}`
                  : `năm`
              }  `,
              data: values,
              backgroundColor: "rgba(75, 192, 192, 0.6)",
              borderColor: "rgba(75, 192, 192, 1)",
              borderWidth: 1,
            },
          ],
        });
      } else {
        setChartData({
          labels: [],
          datasets: [],
        });
      }
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu biểu đồ:", error);
      message.error("Không thể lấy dữ liệu doanh thu");
    }
  };

  // Lấy thống kê phim từ API statApi.getMovieStat
  const fetchMovieStats = async () => {
    try {
      const response = await statApi.getMovieStat({
        theaterId,
      });

      if (response) {
        setMovieStats(response);
      }
    } catch (error) {
      console.error("Lỗi khi lấy thống kê phim:", error);
      message.error("Không thể lấy thống kê phim");
    }
  };

  useEffect(() => {
    fetchTheaters();
  }, []);

  useEffect(() => {
    fetchData();
  }, [timeFilter, month, year, theaterId]);

  useEffect(() => {
    fetchMovieStats();
  }, [theaterId]);

  const columns = [
    {
      title: "Tên phim",
      dataIndex: "movieTitle",
      key: "movieTitle",
    },
    {
      title: "Doanh thu",
      dataIndex: "revenue",
      key: "revenue",
      render: (text) => text.toLocaleString(),
    },
    {
      title: "Số lượng vé",
      dataIndex: "ticketSold",
      key: "ticketSold",
    },
    {
      title: "Số suất chiếu",
      dataIndex: "showtimeCount",
      key: "showtimeCount",
    },
  ];

  return (
    <ConfigProvider>
      <div className="container">
        <Flex gap={10} style={{ marginTop: "10px" }}>
          <AntTitle level={4}>Thống kê doanh thu</AntTitle>
          <Select
            value={theaterId}
            onChange={(value) => setTheaterId(value)}
            placeholder="Chọn rạp"
            style={{ width: 200 }}
            allowClear={user.theaterId === null} // Chỉ admin mới có thể chọn "Toàn bộ rạp"
            disabled={user.theaterId !== null} // Nếu user thường, dropdown bị khóa
          >
            {user.theaterId === null && (
              <Option value={null}>Toàn bộ rạp</Option>
            )}
            {theaters.map((theater) => (
              <Option key={theater.id} value={theater.id}>
                {theater.name}
              </Option>
            ))}
          </Select>
        </Flex>
        <Tabs defaultActiveKey="1">
          <TabPane tab="Thống kê theo thời gian" key="1">
            <div
              className="filters"
              style={{ marginBottom: "20px", display: "flex", gap: "10px" }}
            >
              <Select
                value={timeFilter}
                onChange={(value) => setTimeFilter(value)}
                style={{ width: 120 }}
              >
                <Option value="daily">Theo ngày</Option>
                <Option value="monthly">Theo tháng</Option>
                <Option value="yearly">Theo năm</Option>
              </Select>

              {timeFilter === "daily" && (
                <DatePicker
                  picker="month"
                  value={dayjs(`${year}-${month}`)}
                  onChange={(date) => {
                    if (date) {
                      setMonth(date.month() + 1);
                      setYear(date.year());
                    }
                  }}
                  style={{ width: 150 }}
                  placeholder="Chọn tháng"
                />
              )}

              {(timeFilter === "monthly" || timeFilter === "yearly") && (
                <DatePicker
                  picker="year"
                  value={dayjs(`${year}`)}
                  onChange={(date) => {
                    if (date) {
                      setYear(date.year());
                    }
                  }}
                  style={{ width: 150 }}
                  placeholder="Chọn năm"
                />
              )}
            </div>

            {chartData.labels.length > 0 ? (
              <div
                style={{
                  height: "500px",
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <Bar data={chartData} />
              </div>
            ) : (
              <p>Không có dữ liệu cho các bộ lọc đã chọn.</p>
            )}
          </TabPane>

          <TabPane tab="Thống kê theo phim" key="2">
            <Table
              dataSource={movieStats}
              columns={columns}
              rowKey="movieTitle"
            />
          </TabPane>
        </Tabs>
      </div>
    </ConfigProvider>
  );
};

export default HomeAdmin;
