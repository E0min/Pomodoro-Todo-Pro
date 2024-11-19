import React, { useState, useRef } from "react";
import "./PomodoroTimer.css";

const PomodoroTimer = () => {
  const [time, setTime] = useState(25 * 60); // 초기 타이머 시간 (25분)
  const [isRunning, setIsRunning] = useState(false);
  const timerRef = useRef(null);

  const totalTime = 25 * 60; // 전체 시간 (초 단위)

  const startTimer = () => {
    if (!isRunning) {
      setIsRunning(true);
      timerRef.current = setInterval(() => {
        setTime((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setIsRunning(false);
            alert("Time's up!");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  };

  const stopTimer = () => {
    setIsRunning(false);
    clearInterval(timerRef.current);
  };

  const resetTimer = () => {
    setIsRunning(false);
    clearInterval(timerRef.current);
    setTime(totalTime); // 타이머 시간 초기화
  };

  // 타이머 진행률 계산 (0 ~ 1)
  const progress = time / totalTime;

  // 부채꼴 경로 계산
  const calculateArc = (progress) => {
    const radius = 100; // 반지름
    const centerX = 100; // 원 중심 X 좌표
    const centerY = 100; // 원 중심 Y 좌표
    const startAngle = -90; // 부채꼴 시작 각도 (12시 방향)
    const endAngle = startAngle + progress * 360; // 진행률에 따라 끝 각도 계산

    // 각도를 라디안으로 변환
    const radian = (angle) => (angle * Math.PI) / 180;

    // 시작점
    const startX = centerX + radius * Math.cos(radian(startAngle));
    const startY = centerY + radius * Math.sin(radian(startAngle));

    // 끝점
    const endX = centerX + radius * Math.cos(radian(endAngle));
    const endY = centerY + radius * Math.sin(radian(endAngle));

    // 호가 180도 이상인지 판별 (1: 큰 호, 0: 작은 호)
    const largeArcFlag = progress > 0.5 ? 1 : 0;

    // SVG Path
    return `
      M ${centerX},${centerY} 
      L ${startX},${startY} 
      A ${radius},${radius} 0 ${largeArcFlag} 1 ${endX},${endY} 
      Z
    `;
  };

  return (
    <div className="timer-container">
      <svg width="200" height="200">
        {/* 부채꼴 */}
        <path d={calculateArc(progress)} fill="#ff6b6b" stroke="none" />
      </svg>
      <div className="timer-text">
        <h2>{`${Math.floor(time / 60)}:${String(time % 60).padStart(
          2,
          "0"
        )}`}</h2>
      </div>
      <div className="controls">
        <button onClick={startTimer} disabled={isRunning}>
          Start
        </button>
        <button onClick={stopTimer} disabled={!isRunning}>
          Stop
        </button>
        <button onClick={resetTimer}>Reset</button>
      </div>
    </div>
  );
};

export default PomodoroTimer;
