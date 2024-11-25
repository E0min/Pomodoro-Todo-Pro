import { useState, useRef, useEffect } from "react";

const usePomodoroTimer = (totalTime) => {
  const [time, setTime] = useState(totalTime);
  const [isRunning, setIsRunning] = useState(false);
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);
  const remainingTimeRef = useRef(totalTime);

  const startTimer = () => {
    // 타이머 시작 로직
  };

  const resetTimer = () => {
    // 타이머 리셋 로직
  };

  const completeTimer = () => {
    // 타이머 완료 로직
  };

  const calculateArc = () => {
    // 부채꼴 계산 로직
  };

  useEffect(() => {
    // 타이머 업데이트 로직
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
