import React from "react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white shadow-sm mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="text-center text-sm text-gray-500">
          © {currentYear} Status Service. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
