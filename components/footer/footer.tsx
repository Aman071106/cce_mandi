import React from "react";
import sntcLogo from "@/public/sntc.png";
import Image from "next/image";
import { Github, Linkedin, Mail } from "lucide-react";
import Link from "next/link";

const Footer = () => {
  return (
    <div className="w-full flex gap-0 bg-zinc-900">
      <div className="bg-zinc-900 md:bg-zinc-100 w-full md:w-1/3 p-12 flex flex-col items-center md:items-start">
        <Image src={sntcLogo} alt="sntc logo" width={200} />
        <div className="text-xl md:text-2xl text-zinc-100 md:text-zinc-900 font-medium">
          Presented by SnTC, IIT Mandi
        </div>
        <div className="text-zinc-500 text-center md:text-left">
          Empowering tech-advancement through innovation and discovery
        </div>
        <div className="mt-12 text-zinc-500 text-sm block md:hidden">
          Copyright © 2025, SnTC, IIT Mandi.
        </div>
      </div>
      <div className=" m-12 text-zinc-100 w-2/3 relative hidden md:block">
        <div className="text-xl md:text-2xl text-zinc-100 font-medium">
          About TIP
        </div>
        <div className="text-zinc-500 max-w-screen-lg mb-12">
          The Technical Induction Program is aimed at introducing the
          participants with key technical skills and tools, providing them with
          guidance and support by laying a solid foundation in top tech
          competencies to ensure a seamless transition from school to a
          professional tech-environment.
        </div>
        <div className="flex gap-2.5">
          <Link href={"mailto:technical_secretary@students.iitmandi.ac.in"}>
            <Mail />
          </Link>
          <Link
            href={"https://www.linkedin.com/in/aryan0singh/"}
            target="_blank"
          >
            <Linkedin />
          </Link>
          
        </div>
        <div className="absolute bottom-0 left-0 text-sm text-zinc-500">
          Copyright © 2025, SnTC, IIT Mandi.
        </div>
      </div>
    </div>
  );
};

export default Footer;
