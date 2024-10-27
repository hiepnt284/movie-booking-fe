import React from "react";
import { Carousel } from "antd";
import { ConfigProvider } from "antd";
const contentStyle = {
  height: "600px",
  color: "#fff",
  lineHeight: "160px",
  textAlign: "center",
  background: "#364d79",
};

const CarouselHome = () => {
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
      <Carousel arrows autoplay>
        <div>
          <h3 style={contentStyle}>
            <img
              src="https://bhdstar.vn/wp-content/uploads/2024/10/referenceSchemeHeadOfficeallowPlaceHoldertrueheight1069ldapp-15.jpg"
              alt=""
              width={"100%"}
              height={"100%"}
              style={{ objectFit: "cover" }}
            />
          </h3>
        </div>
        <div>
          <h3 style={contentStyle}>
            <img
              src="https://bhdstar.vn/wp-content/uploads/2024/10/referenceSchemeHeadOfficeallowPlaceHoldertrueheight1069ldapp-17.jpg"
              alt=""
              width={"100%"}
              height={"100%"}
              style={{ objectFit: "cover" }}
            />
          </h3>
        </div>
        <div>
          <h3 style={contentStyle}>
            <img
              src="https://bhdstar.vn/wp-content/uploads/2024/10/referenceSchemeHeadOfficeallowPlaceHoldertrueheight1069ldapp.png"
              alt=""
              width={"100%"}
              height={"100%"}
              style={{ objectFit: "cover" }}
            />
          </h3>
        </div>
      </Carousel>
    </ConfigProvider>
  );
};

export default CarouselHome;
