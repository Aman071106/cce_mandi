import React from "react";
import sntcLogo from "@/public/sntc.png";
import Image from "next/image";
import { Linkedin, Mail } from "lucide-react";
import Link from "next/link";

const Footer = () => {
  return (
    <div className="w-full flex flex-col md:flex-row gap-0 bg-gray-50 border-t border-gray-200">
      {/* Left Section */}
      <div className="bg-gray-50 w-full md:w-1/3 p-12 flex flex-col items-center md:items-start">
        <Image src={sntcLogo} alt="sntc logo" width={180} className="mb-4" />
        <div className="text-xl md:text-2xl text-gray-900 font-semibold">
          Presented by IIT Mandi
        </div>
        <div className="text-gray-600 text-center md:text-left mt-2">
          Empowering education through innovation and research.
        </div>
        <div className="mt-10 text-gray-500 text-sm block md:hidden">
          © 2025, CCE, IIT Mandi.
        </div>
      </div>

      {/* Right Section */}
      <div className="m-12 text-gray-900 w-full md:w-2/3 relative hidden md:block">
        <div className="text-xl md:text-2xl font-semibold mb-3">
          About CCE
        </div>
        <div className="text-gray-600 max-w-screen-lg mb-10 leading-relaxed">
          CCE IIT Mandi provides learners with a platform to study and gain
          exposure at IIT Mandi through outreach programs and delivers
          accessible, high-quality continuing education that equips learners
          with skills, knowledge, and opportunities for lifelong growth.
        </div>

        {/* Social Links */}
        <div className="flex gap-3 mb-6">
          <Link
            href="mailto:cceoffice@iitmandi.ac.in"
            className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition"
          >
            <Mail className="text-gray-700" />
          </Link>
          <Link
            href="https://www.linkedin.com/company/cce-iitmandi/"
            target="_blank"
            className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition"
          >
            <Linkedin className="text-gray-700" />
          </Link>
        </div>

        {/* Copyright */}
        <div className="absolute bottom-0 left-0 text-sm text-gray-500">
          © 2025, CCE, IIT Mandi. All rights reserved.
        </div>
      </div>
    </div>
  );
};

export default Footer;
