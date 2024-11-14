import React, { useState, useEffect } from "react";
import { Carousel } from "antd";
import { ConfigProvider, Spin, Alert } from "antd";
import carouselApi from "../api/carouselApi";
import { Link } from "react-router-dom";

const contentStyle = {
  height: "600px",
  color: "#fff",
  lineHeight: "160px",
  textAlign: "center",
  background: "#364d79",
};

const CarouselHome = () => {
  const [carousels, setCarousels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCarousels = async () => {
    try {
      setLoading(true);
      setError(null); // Reset error trước mỗi lần gọi API
      const data = await carouselApi.getAllForUser();
      setCarousels(data.result || []);
    } catch (error) {
      setError("Failed to fetch carousel images");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCarousels();
  }, []);

  return (
    <ConfigProvider
      theme={{
        components: {
          Carousel: {
            arrowSize: 64,
            arrowOffset: 8,
            dotActiveWidth: 32,
            dotGap: 8,
            dotHeight: 12,
            dotOffset: 12,
            dotWidth: 24,
          },
        },
      }}
    >
      {loading ? (
        <Spin
          tip="Loading..."
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: "50px",
          }}
        />
      ) : error ? (
        <Alert message="Error" description={error} type="error" showIcon />
      ) : (
        <Carousel arrows autoplay>
          {carousels.map((item, index) => (
            <div key={index}>
              <Link to={item.link}>
                <h3 style={contentStyle}>
                  <img
                    src={item.img}
                    alt={`Carousel item ${index + 1}`}
                    width="100%"
                    height="100%"
                    style={{ objectFit: "cover" }}
                  />
                </h3>
              </Link>
            </div>
          ))}
        </Carousel>
      )}
    </ConfigProvider>
  );
};

export default CarouselHome;
