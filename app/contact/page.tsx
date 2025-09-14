import React from "react";
import { Mail, Phone, MapPin, Linkedin } from "lucide-react";
import Link from "next/link";

const ContactPage = () => {
  return (
    <div className="fade-in-page">
      {/* Page Header */}
      <section className="relative w-full bg-gradient-to-r from-blue-50 to-cyan-50 border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-20 flex flex-col items-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mt-10 mb-4 text-center">
            Contact Us
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl text-center leading-relaxed">
            Have questions about our programs, workshops, or collaborations?  
            We're here to help and would love to hear from you.
          </p>
        </div>
      </section>

      {/* Contact Information */}
      <section className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 px-6 py-16">
        
        {/* Address */}
        <div className="bg-white rounded-xl shadow-sm p-8 flex flex-col items-center text-center border border-gray-100 hover:shadow-md transition-all duration-300 hover:border-blue-100">
          <div className="bg-blue-50 p-3 rounded-full mb-4">
            <MapPin className="text-blue-600" size={28} />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Our Location</h2>
          <p className="text-gray-600 leading-relaxed">
            Centre for Continuing Education  
            <br /> North Campus, IIT Mandi  
            <br /> Kamand, Mandi, Himachal Pradesh – 175075
          </p>
        </div>

        {/* Email */}
        <div className="bg-white rounded-xl shadow-sm p-8 flex flex-col items-center text-center border border-gray-100 hover:shadow-md transition-all duration-300 hover:border-blue-100">
          <div className="bg-blue-50 p-3 rounded-full mb-4">
            <Mail className="text-blue-600" size={28} />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Email Us</h2>
          <Link
            href="mailto:cceoffice@iitmandi.ac.in"
            className="text-blue-700 hover:text-blue-800 transition-colors duration-200 font-medium"
          >
            cceoffice@iitmandi.ac.in
          </Link>
        </div>

        {/* Phone */}
        <div className="bg-white rounded-xl shadow-sm p-8 flex flex-col items-center text-center border border-gray-100 hover:shadow-md transition-all duration-300 hover:border-blue-100">
          <div className="bg-blue-50 p-3 rounded-full mb-4">
            <Phone className="text-blue-600" size={28} />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Call Us</h2>
          <p className="text-gray-600 font-medium">
            01905-267742
			<br></br>
			01905- 267788
          </p>
        </div>
      </section>

      {/* Social Section */}
      <section className="max-w-6xl mx-auto px-6 pb-20 flex justify-center">
        <Link
          href="https://www.linkedin.com/company/cce-iitmandi/"
          target="_blank"
          className="flex items-center gap-3 px-6 py-3 rounded-lg bg-blue-600 text-white font-medium shadow-sm hover:bg-blue-700 transition-all duration-300 hover:shadow-md"
        >
          <Linkedin size={20} />
          Follow us on LinkedIn
        </Link>
      </section>
    </div>
  );
};

export default ContactPage;