import { app } from "../firebase/firebaseConfig";
import React, { useState, useEffect } from "react";

import Navbar from "../components/Navbar"; // 올바른 파일 경로
const HomePage = () => {
  return (
    <Navbar
      style={{
        width: "100%",
      }}
    ></Navbar>
  );
};

export default HomePage;
