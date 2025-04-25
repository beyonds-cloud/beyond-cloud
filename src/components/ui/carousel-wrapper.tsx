"use client";

import React from "react";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";

const CarouselWrapper = ({
  images,
  locations,
  responsive,
}: {
  images: string[];
  locations: string[];
  responsive: any;
}) => {
  return (
    <Carousel responsive={responsive} infinite autoPlay autoPlaySpeed={3000}>
      {images.map((image, index) => (
        <div key={index} className="px-2">
          <img
            src={image}
            alt={`carousel-${index}`}
            className="rounded-xl shadow-lg w-full h-64 object-cover"
          />
          <p className="mt-2 text-center text-base text-[#A0AEC0]">
            {locations[index] || "Unknown Location"}
          </p>
        </div>
      ))}
    </Carousel>
  );
};

export default CarouselWrapper;
