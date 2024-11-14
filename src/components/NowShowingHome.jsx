import { Button, Col, ConfigProvider, Row, Tabs, Spin } from "antd";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import movieApi from "../api/movieApi";
import Title from "antd/es/typography/Title";
import './style/NowShowingHome.css'

const NowShowingHome = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMovies = async (type) => {
    try {
      setLoading(true);
      setError(null); // Reset error trước mỗi lần gọi API
      const data =
        type === "nowShowing"
          ? await movieApi.getNowShowing()
          : await movieApi.getComingSoon();
      setMovies(data.result || []);
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies("nowShowing");
  }, []);

  const onChange = (key) => {
    fetchMovies(key === "1" ? "nowShowing" : "comingSoon");
  };

  const renderMovies = () => (
    <Row gutter={[40, 40]}>
      {loading ? (
        <Spin size="large" />
      ) : error ? (
        <p>Đã có lỗi xảy ra: {error.message}</p>
      ) : movies.length > 0 ? (
        movies.map((movie) => (
          <Col key={movie.id} xs={24} sm={12} md={12} lg={6}>
            <Link to={`/movie/${movie.id}`}>
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
              <Button type="primary" block style={{ fontWeight: "bold" }}>
                ĐẶT VÉ
              </Button>
            </Link>
          </Col>
        ))
      ) : (
        <p>Không có phim nào.</p>
      )}
    </Row>
  );

  const items = [
    {
      key: "1",
      label: "PHIM ĐANG CHIẾU",
      children: renderMovies(),
    },
    {
      key: "2",
      label: "PHIM SẮP CHIẾU",
      children: renderMovies(),
    },
  ];

  return (
    <div
      style={{
        minHeight: 600,
        padding: "30px 140px",
        background: "white",
      }}
    >
      <ConfigProvider
        theme={{
          components: {
            Tabs: {
              titleFontSizeLG: 30,
            },
          },
        }}
      >
        <Tabs
          type="line"
          defaultActiveKey="1"
          items={items}
          onChange={onChange}
          size="large"
          centered
          tabBarStyle={{
            
          }}
        />
      </ConfigProvider>
    </div>
  );
};

export default NowShowingHome;
