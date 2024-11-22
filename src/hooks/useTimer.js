import { useState, useRef, useEffect } from "react";

export const useTimer = (totalTime, onComplete) => {
  const [time, setTime] = useState(totalTime);
  const [isRunning, setIsRunning] = useState(false);
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);
  const remainingTimeRef = useRef(totalTime);

  const startTimer = () => {
    if (!isRunning) {
      setIsRunning(true);
      startTimeRef.current = Date.now();
      timerRef.current = setInterval(() => {
        const now = Date.now();
        const elapsed = Math.floor((now - startTimeRef.current) / 1000);
        const remaining = Math.max(remainingTimeRef.current - elapsed, 0);
        setTime(remaining);

        if (remaining <= 0) {
          clearInterval(timerRef.current);
          setIsRunning(false);
          onComplete(); // 타이머 종료 시 실행
        }
      }, 1000);
    } else {
      clearInterval(timerRef.current);
      setIsRunning(false);
      const now = Date.now();
      const elapsed = Math.floor((now - startTimeRef.current) / 1000);
      remainingTimeRef.current = Math.max(
        remainingTimeRef.current - elapsed,
        0
      );
    }
  };

  const resetTimer = () => {
    clearInterval(timerRef.current);
    setIsRunning(false);
    setTime(totalTime);
    remainingTimeRef.current = totalTime;
  };

  useEffect(() => {
    return () => clearInterval(timerRef.current); // 컴포넌트 언마운트 시 클리어
  }, []);

  return { time, isRunning, startTimer, resetTimer };
};
