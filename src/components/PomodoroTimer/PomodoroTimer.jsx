import React, { useState, useRef, useEffect } from "react";
import { auth, db } from "../../firebase/firebaseConfig"; // Firestore 및 Auth 임포트
import { onAuthStateChanged } from "firebase/auth";
import { doc, updateDoc, setDoc, getDoc } from "firebase/firestore";
import "./PomodoroTimer.css";

const PomodoroTimer = () => {
  const [time, setTime] = useState(25 * 60); // 초기 타이머 시간 (25분)
  const [isRunning, setIsRunning] = useState(false);
  const [user, setUser] = useState(null); // 사용자 정보
  const [pomoCount, setPomoCount] = useState(0); // 오늘의 포모도 수
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);
  const remainingTimeRef = useRef(25 * 60);
  const totalTime = 25 * 60;

  // 로그인 상태 감지
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser && currentUser.email) {
        fetchFirestorePomo(currentUser.email); // email 기반으로 Firestore 데이터 로드
      } else {
        fetchLocalStoragePomo(); // 비로그인 상태 시 로컬 스토리지 데이터 로드
      }
    });
    return () => unsubscribe();
  }, []);

  // Firestore에서 오늘의 포모도 가져오기
  const fetchFirestorePomo = async (email) => {
    try {
      const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
      const docRef = doc(db, "pomodoros", email); // email 기반 문서
      const docSnap = await getDoc(docRef);

      if (docSnap.exists() && docSnap.data()[today]) {
        setPomoCount(docSnap.data()[today]);
      } else {
        setPomoCount(0);
      }
    } catch (error) {
      console.error("Firestore 데이터 로드 실패:", error);
      setPomoCount(0); // 실패 시 기본값 설정
    }
  };

  // 로컬 스토리지에서 오늘의 포모도 가져오기
  const fetchLocalStoragePomo = () => {
    try {
      const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
      const localData = JSON.parse(localStorage.getItem("pomodoros")) || {};
      setPomoCount(localData[today] || 0); // 오늘 데이터가 없으면 0
    } catch (error) {
      console.error("로컬 스토리지 데이터 로드 실패:", error);
      setPomoCount(0); // 실패 시 기본값 설정
    }
  };

  const savePomo = async (elapsed) => {
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    const cumulativeTimeKey = "cumulativeTime"; // Firestore 문서에서 누적 시간 키 이름

    if (user && user.email) {
      // 유저가 로그인 상태라면
      try {
        const docRef = doc(db, "pomodoros", user.email); // email 기반 문서
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const savedTime = docSnap.data()[cumulativeTimeKey] || 0; // Firestore에 저장된 누적 시간
          await updateDoc(docRef, {
            [today]: (elapsed + savedTime) / 25, // 포모도로 수 계산
            [cumulativeTimeKey]: elapsed + savedTime, // 누적 시간 업데이트
          });
        } else {
          await setDoc(docRef, {
            [today]: elapsed / 25, // 첫 포모도로 수 저장
            [cumulativeTimeKey]: elapsed, // 첫 누적 시간 저장
          });
        }
      } catch (error) {
        console.error("Firestore 데이터 저장 실패:", error);
      }
    } else {
      try {
        // 로컬 스토리지에 저장
        const localData = JSON.parse(localStorage.getItem("pomodoros")) || {};
        localData[today] = (localData[today] || 0) + elapsed / 25; // 포모도로 수 계산
        localStorage.setItem("pomodoros", JSON.stringify(localData));
      } catch (error) {
        console.error("로컬 스토리지 데이터 저장 실패:", error);
      }
    }

    // UI 업데이트
    setPomoCount((prev) => prev + elapsed / 25);
  };

  const completeTimer = () => {
    if (isRunning) {
      clearInterval(timerRef.current);
      setIsRunning(false);
      setTime(60 * 25);
      savePomo(25); // Complete 버튼 클릭 시 저장
    }
  };

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
          savePomo(elapsed);
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

  // 부채꼴 경로 계산
  const calculateArc = () => {
    const radius = 130; // 반지름
    const centerX = 130; // 원 중심 X 좌표
    const centerY = 130; // 원 중심 Y 좌표
    const startAngle = -90; // 부채꼴 시작 각도 (12시 방향)
    const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000); // 현재까지 경과 시간
    const endAngle = 60 - 0.1 * elapsed; // 고정된 끝 각도
    console.log(endAngle);
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
        <path d={calculateArc()} fill="#ff6b6b" stroke="none" />
      </svg>
      <div className="timer-text">
        <h2>{`${Math.floor(time / 60)}:${String(time % 60).padStart(
          2,
          "0"
        )}`}</h2>
      </div>
      <div className="controls">
        <button onClick={startTimer}>{isRunning ? "Pause" : "Start"}</button>
        {isRunning && (
          <button className="complete-btn" onClick={completeTimer}>
            Complete
          </button>
        )}
        <button onClick={resetTimer}>Reset</button>
      </div>
      <h2>Today's Pomo: {pomoCount}</h2>
    </div>
  );
};

export default PomodoroTimer;
