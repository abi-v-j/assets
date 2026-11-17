import React from "react";
import { Route, Routes } from "react-router";
import HomePage from "../landing/pages/HomePage";
import About from "../landing/pages/About";
import Contact from "../landing/pages/Contact";

const LandingRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="" element={<HomePage />} />
      <Route path="about" element={<About />} />
      <Route path="contact" element={<Contact />} />
    </Routes>
  );
};

export default LandingRoutes;
