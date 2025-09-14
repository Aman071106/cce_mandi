"use client";

import React, { useEffect, useState } from "react";
import styles from "./testimonials.module.scss";
// import { testimonials } from "@/lib/testimonials";

const Testimonials = () => {
  const [testimonial, setTestimonial] = useState({
    text: "An exciting series of specially curated sessions to boost your confidence in core technologies",
    author: "Initial Author",
  });

  // useEffect(() => {
  //   let i = 0;
  //   const timer = setInterval(() => {
  //     setTestimonial(testimonials[i]);
  //     i = i >= testimonials.length - 1 ? 0 : (i % testimonials.length) + 1;
  //   }, 5000);
  //   return () => clearInterval(timer);
  // }, []);

  return (
    <div className="w-full px-12 p-24 bg-zinc-900 text-zinc-100">
      <div className="text-4xl md:text-6xl font-semibold tracking-tight md:leading-normal max-w-screen-2xl pb-5">
        {/* &apos;{testimonial.text}&apos; */}
      </div>
      <div className="w-full h-0.5 bg-zinc-800">
        {/* <div className={styles.progressBar} key={testimonial.author} /> */}
      </div>
    </div>
  );
};

export default Testimonials;
