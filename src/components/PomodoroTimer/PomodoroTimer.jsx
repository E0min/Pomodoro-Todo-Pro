import React, { useState, useRef, useEffect } from "react";
import "./PomodoroTimer.css";

const PomodoroTimer = () => {
  const [time, setTime] = useState(25 * 60); // 초기 타이머 시간 (25분)
  const [isRunning, setIsRunning] = useState(false);
  const timerRef = useRef(null); // `setInterval` 참조
  const startTimeRef = useRef(null); // 타이머 시작 시간
  const remainingTimeRef = useRef(25 * 60); // 남은 시간 저장
  const totalTime = 25 * 60; // 전체 시간 (초 단위)

  useEffect(() => {
    // 타이머 시간이 업데이트될 때마다 Title 변경
    const minutes = Math.floor(time / 60);
    const seconds = String(time % 60).padStart(2, "0");
    document.title = `${minutes}:${seconds} - Pomodoro Timer`;
  }, [time]);

  const startTimer = () => {
    if (!isRunning) {
      setIsRunning(true);
      startTimeRef.current = Date.now(); // 타이머 시작 시각 기록
      timerRef.current = setInterval(() => {
        const now = Date.now();
        const elapsed = Math.floor((now - startTimeRef.current) / 1000); // 경과 시간 (초)
        const remaining = Math.max(remainingTimeRef.current - elapsed, 0); // 남은 시간 계산
        setTime(remaining);

        if (remaining <= 0) {
          clearInterval(timerRef.current);
          setIsRunning(false);
          alert("Time's up!");
        }
      }, 1000);
    }
  };

  const stopTimer = () => {
    if (isRunning) {
      setIsRunning(false);
      clearInterval(timerRef.current); // 타이머 중지
      const now = Date.now();
      const elapsed = Math.floor((now - startTimeRef.current) / 1000); // 현재까지 경과 시간
      remainingTimeRef.current = Math.max(remainingTimeRef.current - elapsed, 0); // 남은 시간 저장
    }
  };

  const resetTimer = () => {
    setIsRunning(false);
    clearInterval(timerRef.current);
    setTime(totalTime); // 초기화
    remainingTimeRef.current = totalTime;
  };

  // 타이머 진행률 계산 (0 ~ 1)
  const progress = time / totalTime;

  // 부채꼴 경로 계산
  const calculateArc = (progress) => {
    const radius = 130; // 반지름
    const centerX = 130; // 원 중심 X 좌표
    const centerY = 130; // 원 중심 Y 좌표
    const startAngle = -90; // 부채꼴 시작 각도 (12시 방향)
    const endAngle = 60; // 고정된 끝 각도

    // 각도를 라디안으로 변환
    const radian = (angle) => (angle * Math.PI) / 180;

    // 시작점
    const startX = centerX + radius * Math.cos(radian(startAngle));
    const startY = centerY + radius * Math.sin(radian(startAngle));

    // 끝점
    const endX = centerX + radius * Math.cos(radian(endAngle));
    const endY = centerY + radius * Math.sin(radian(endAngle));

    // 호가 180도 이상인지 판별
    const largeArcFlag = Math.abs(endAngle - startAngle) > 180 ? 1 : 0;
    
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
      <svg width="260" height="260">
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
