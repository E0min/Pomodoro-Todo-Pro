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
  const timerRef = useRef(null); //타이머의 ID값을 저장
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

  // Firestore에서 오늘의 타이머 데이터 불러오기
  const fetchFirestorePomo = async (email) => {
    try {
      const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
      const docRef = doc(db, "pomodoros", email); // email 기반 문서
      const docSnap = await getDoc(docRef);

      if (docSnap.exists() && docSnap.data()[today]) {
        const elapsedSeconds = docSnap.data()[today]; // Firestore에 저장된 초 단위 데이터
        setPomoCount(elapsedSeconds / 1500); // 1500초 = 25분
      } else {
        setPomoCount(0); // 오늘 데이터가 없으면 0
      }
    } catch (error) {
      console.error("Firestore 데이터 로드 실패:", error);
      setPomoCount(0); // 실패 시 기본값 설정
    }
  };

  // 로컬 스토리지에서 오늘의 타이머 데이터 불러오기
  const fetchLocalStoragePomo = () => {
    try {
      const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
      const localData = JSON.parse(localStorage.getItem("pomodoros")) || {};
      const elapsedSeconds = localData[today] || 0;
      setPomoCount(elapsedSeconds / 1500); // 1500초 = 25분
    } catch (error) {
      console.error("로컬 스토리지 데이터 로드 실패:", error);
      setPomoCount(0); // 실패 시 기본값 설정
    }
  };

  // 타이머 완료 시 데이터 저장
  const savePomo = async (elapsed) => {
    // 현재 흘러간 시간을 인자로 받아서 저장
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

    if (user && user.email) {
      // Firestore에 저장
      try {
        const docRef = doc(db, "pomodoros", user.email); // email 기반 문서
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const savedTime = docSnap.data()[today] || 0; // Firestore에 저장된 누적 시간
          await updateDoc(docRef, {
            [today]: elapsed + savedTime, // 초 단위 누적 저장
          });
        } else {
          await setDoc(docRef, {
            [today]: elapsed, // 첫 초 단위 데이터 저장
          });
        }
      } catch (error) {
        console.error("Firestore 데이터 저장 실패:", error);
      }
    } else {
      // 로컬 스토리지에 저장
      try {
        const localData = JSON.parse(localStorage.getItem("pomodoros")) || {};
        localData[today] = (localData[today] || 0) + elapsed; // 초 단위 누적 저장
        localStorage.setItem("pomodoros", JSON.stringify(localData));
      } catch (error) {
        console.error("로컬 스토리지 데이터 저장 실패:", error);
      }
    }

    // UI 업데이트
    setPomoCount((prev) => prev + elapsed / 1500); // 1500초 = 25분
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
      <h2>Today's Pomo: {Math.floor(pomoCount)}</h2>
    </div>
  );
};

export default PomodoroTimer;
