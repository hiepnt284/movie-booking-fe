import { Button, Card, Col, Row } from "antd";
import Meta from "antd/es/card/Meta";
import Title from "antd/es/typography/Title";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import movieApi from "../api/movieApi";

const NowShowingHome = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    movieApi
      .getAllActive()
      .then((data) => {
        // Kiểm tra xem data.result và data.result.content có tồn tại hay không
        if (data && data.result) {
          setMovies(data.result); // Cập nhật state với danh sách phim
        } else {
          setMovies([]); // Nếu không có nội dung, đặt là mảng rỗng
        }
        setLoading(false); // Đã tải xong
      })
      .catch((error) => {
        setError(error); // Cập nhật state với lỗi
        setLoading(false); // Đã tải xong dù có lỗi
      });
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Đã có lỗi xảy ra: {error.message}</p>;

  return (
    <div
      style={{
        minHeight: 600,
        padding: "0 70px",
        background: "white",
      }}
    >
      <Title>Phim đang chiếu</Title>
      <Row gutter={[40, 40]}>
        {movies.length > 0 ? (
          movies.map((movie) => (
            <Col key={movie.id} xs={24} sm={12} md={12} lg={6}>
              <Card
                hoverable
                style={{ width: "100%" }}
                cover={<img alt={movie.title} src={movie.poster} />}
              >
                <Meta title={movie.title} description={movie.description} />
                <Link to={`movie/${movie.id}`}>
                  <Button type="primary" block>
                    Chi tiết
                  </Button>
                </Link>
              </Card>
            </Col>
          ))
        ) : (
          <p>Không có phim nào đang chiếu.</p>
        )}
      </Row>
    </div>
  );
};

export default NowShowingHome;
