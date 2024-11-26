// PomoReport.jsx
import React, { useState, useEffect, useRef } from "react";
import { doc, getDoc } from "firebase/firestore"; // Firestore 메서드
import { db } from "../../firebase/firebaseConfig"; // Firebase 초기화 파일
import { useAuth } from "../../context/AuthContext"; // AuthContext에서 useAuth 가져오기
import "./PomoReport.css"; // CSS 파일 유지

const PomoReport = ({ onClose }) => {
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [pomodoroData, setPomodoroData] = useState({});
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth(); // Context에서 로그인 상태 가져오기

  useEffect(() => {
    if (!currentUser || !currentUser.email) {
      console.warn("No authenticated user found.");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const docRef = doc(db, "pomodoros", currentUser.email); // email 기반 문서
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const rawData = docSnap.data(); // Firestore 데이터 가져오기
          console.log("Raw data from Firestore:", rawData);

          const transformedData = transformData(rawData); // 데이터 변환
          console.log("Transformed data:", transformedData);

          setPomodoroData(transformedData); // 상태 저장
        } else {
          console.log("No such document!");
        }
      } catch (error) {
        console.error("Error fetching data: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentUser]);

  // 데이터 변환 함수: "YYYY-MM-DD seconds" 형식을 분 단위로 변환
  const transformData = (rawData) => {
    const transformed = {};

    Object.entries(rawData).forEach(([date, seconds]) => {
      const [year, month, day] = date.split("-");
      const key = `${year}-${String(month).padStart(2, "0")}`; // 월을 두 자리로 패딩
      const dayNum = parseInt(day, 10);

      if (!transformed[key]) {
        transformed[key] = {};
      }

      // 초를 분으로 변환
      transformed[key][dayNum] = Math.round(seconds / 60); // 반올림
    });

    return transformed;
  };

  // 현재 월의 마지막 날짜 계산
  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const handlePreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentYear(currentYear - 1);
      setCurrentMonth(11);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentYear(currentYear + 1);
      setCurrentMonth(0);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const currentMonthKey = `${currentYear}-${String(currentMonth + 1).padStart(
    2,
    "0"
  )}`;
  const currentMonthData = pomodoroData[currentMonthKey] || {};

  // 최대 시간 계산 (y축 눈금을 결정하기 위해)
  const maxMinutes = Math.max(...Object.values(currentMonthData), 0);
  console.log("Max Minutes:", maxMinutes);

  // y축 눈금 생성 (예: 0, 10, 20, ...)
  const yAxisTicks = [];
  const yAxisStep = 10; // 눈금 간격 (분 단위로 설정)
  for (let i = 0; i <= maxMinutes + yAxisStep; i += yAxisStep) {
    yAxisTicks.push(i);
  }
  console.log("Y-Axis Ticks:", yAxisTicks);

  // 누적 공부 시간 계산
  const cumulativeMinutes = Object.values(currentMonthData).reduce(
    (sum, minutes) => sum + minutes,
    0
  );

  // 분을 시간 및 분 형식으로 변환하는 헬퍼 함수
  const formatMinutes = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours > 0 ? `${hours}h ` : ""}${remainingMinutes}m`;
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-btn" onClick={onClose}>
          ×
        </button>
        <div>
          <h1>Pomodoro Report</h1>
          <h3>Total Study Time: {formatMinutes(cumulativeMinutes)}</h3>
        </div>
        <div className="chart-header">
          <button className="previous-month" onClick={handlePreviousMonth}>
            &lt;
          </button>
          <h2>{currentMonthKey}</h2>
          <button className="next-month" onClick={handleNextMonth}>
            &gt;
          </button>
        </div>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="chart-container">
            <div className="y-axis">
              {yAxisTicks
                .slice()
                .reverse()
                .map((tick) => (
                  <div key={tick} className="y-axis-tick">
                    {tick} min
                  </div>
                ))}
            </div>
            <div className="bar-chart">
              {Array.from(
                { length: getDaysInMonth(currentYear, currentMonth) },
                (_, i) => i + 1
              ).map((day) => {
                const dayPomodoroMinutes = currentMonthData[day] || 0;
                const barHeight =
                  maxMinutes > 0 ? (dayPomodoroMinutes / maxMinutes) * 100 : 0;

                console.log(
                  `Day: ${day}, Minutes: ${dayPomodoroMinutes}, Bar Height: ${barHeight}%`
                );

                return (
                  <div key={day} className="bar-container">
                    <div
                      className="bar"
                      style={{ height: `${barHeight}%` }}
                      data-tooltip={`${dayPomodoroMinutes} min`}
                    ></div>
                    <span className="bar-label">{day}</span>
                  </div>
                );
              })}
            </div>
            {/* 누적 공부 시간 표시 */}
          </div>
        )}
      </div>
    </div>
  );
};

export default PomoReport;
