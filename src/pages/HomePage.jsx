// import { app } from "../firebase/firebaseConfig";
import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar/Navbar"; // 올바른 파일 경로
import PomodoroTimer from "../components/PomodoroTimer/PomodoroTimer";

const HomePage = () => {

  return (
    <div
      style={{
        width: "100%",
      }}
    >
      <Navbar></Navbar>
      <PomodoroTimer></PomodoroTimer>
    </div>
  );
};

export default HomePage;
