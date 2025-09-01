"use client";

import React, { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Button from "@/components/button/button";
import { eventData } from "@/lib/event-data";
import styles from "./event-carousel.module.scss";
import useSwipe from "@/components/home/use-swipe";
import Link from "next/link";

const EventCarousel = () => {
  const [index, setIndex] = useState(0);
  const swipeHandlers = useSwipe({
    onSwipedLeft: () => {
      setIndex((prevIndex) => (prevIndex + 1) % eventData.length);
    },
    onSwipedRight: () => {
      setIndex((prevIndex) =>
        prevIndex <= 0
          ? eventData.length + (prevIndex - 1)
          : (prevIndex - 1) % eventData.length,
      );
    },
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setIndex((prevIndex) => (prevIndex + 1) % eventData.length);
    }, 5000);
    if (index < 0) setIndex((i) => eventData.length + i);
    return () => clearTimeout(timer);
  }, [index]);

  return (
    <>
      <div
        className="w-full flex flex-row gap-0 min-h-[500px] relative"
        {...swipeHandlers}
      >
        <div
          className="flex absolute left-0 top-0 z-10 cursor-pointer h-full px-2 py-12 flex-col justify-center items-center text-zinc-100"
          onClick={() => {
            setIndex((prevIndex) =>
              prevIndex <= 0
                ? eventData.length + (prevIndex - 1)
                : (prevIndex - 1) % eventData.length,
            );
          }}
        >
          <ChevronLeft size={48} />
        </div>
        {eventData
          .concat(eventData.slice(0, 2))
          .slice(index, index + 3)
          .map((data, i) => (
            <div className="hidden md:block w-1/3 bg-zinc-900" key={i}>
              <div
                className={
                  "w-full h-full text-zinc-100" +
                  " flex flex-col justify-end items-start uppercase " +
                  styles.carouselItem
                }
                style={{
                  background: `url("${encodeURI(data.img)}")`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
                key={index}
              >
                <div className="w-full p-5 bg-zinc-900/[0.7] ">
                  <div className="w-full truncate text-2xl lg:text-4xl font-semibold tracking-tight md:leading-normal ">
                    {data.name}
                  </div>
                  <Link href={`/events#event-${data.id}`}>
                    <Button variant="transparent">details</Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        <div
          className={
            "flex md:hidden w-full flex-col justify-end" +
            " items-start" +
            " uppercase text-zinc-100 " +
            styles.carouselItem
          }
          style={{
            backgroundImage: "url(" + eventData[index].img + ")",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="w-full p-5 bg-zinc-900/[0.7]">
            <div className="w-full text-2xl font-semibold tracking-tight leading-normal truncate">
              {eventData[index].name}
            </div>
            <Link href={`/events#event-${eventData[index].id}`}>
              <Button variant="transparent">details</Button>
            </Link>
          </div>
        </div>
        <div
          className="flex absolute right-0 top-0 z-10 cursor-pointer h-full px-2 py-12 flex-col justify-center items-center text-zinc-100"
          onClick={() => {
            setIndex((prevIndex) => (prevIndex + 1) % eventData.length);
          }}
        >
          <ChevronRight size={48} />
        </div>
      </div>
    </>
  );
};

export default EventCarousel;
