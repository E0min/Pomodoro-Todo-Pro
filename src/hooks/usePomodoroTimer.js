import { useState, useRef, useEffect } from "react";

const usePomodoroTimer = (totalTime) => {
  const [time, setTime] = useState(totalTime);
  const [isRunning, setIsRunning] = useState(false);
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);
  const remainingTimeRef = useRef(totalTime);

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
          savePomo(totalTime);
          alert("Time's up!");
        }
      }, 1000);
    } else {
      setIsRunning(false);
      clearInterval(timerRef.current); // 타이머 중지
      const now = Date.now();
      const elapsed = Math.floor((now - startTimeRef.current) / 1000); // 현재까지 경과 시간
      remainingTimeRef.current = Math.max(
        remainingTimeRef.current - elapsed,
        0
      ); // 남은 시간 저장
    }
  };

  const resetTimer = () => {
    setIsRunning(false);
    clearInterval(timerRef.current);
    setTime(totalTime); // 초기화
    remainingTimeRef.current = totalTime;
  };

  // 타이머 완료 이벤트
  const completeTimer = () => {
    const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000); // 경과 시간 (초)

    if (isRunning) {
      clearInterval(timerRef.current);
      setIsRunning(false);
      setTime(60 * 25); // 타이머 초기화
      console.log(elapsed);
      savePomo(elapsed); // 지나간 시간 삽입
    }
  };

  // 부채꼴 경로 계산
  const calculateArc = () => {
    const radius = 130; // 반지름
    const centerX = 130; // 원 중심 X 좌표
    const centerY = 130; // 원 중심 Y 좌표
    const startAngle = -90; // 부채꼴 시작 각도 (12시 방향)

    // 현재 시간 기반 경과 시간 계산
    const elapsed =
      startTimeRef.current !== null
        ? Math.floor((Date.now() - startTimeRef.current) / 1000)
        : 0; // 초기 렌더링 시 elapsed는 0

    // 초기 endAngle은 60, 이후에는 동적으로 계산
    const endAngle = elapsed === 0 ? 60 : 60 - 0.1 * elapsed;

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

  useEffect(() => {
    // 타이머 시간이 업데이트될 때마다 Title 변경
    const minutes = Math.floor(time / 60);
    const seconds = String(time % 60).padStart(2, "0");
    document.title = `${minutes}:${seconds} - Pomodoro Timer`;
  }, [time]);
  return {
    time,
    isRunning,
    startTimer,
    resetTimer,
    completeTimer,
    calculateArc,
  };
};

export default usePomodoroTimer;
