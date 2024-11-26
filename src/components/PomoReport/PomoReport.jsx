import React, { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore"; // Firestore 메서드
import { db } from "../../firebase/firebaseConfig"; // Firebase 초기화 파일
import "./PomoReport.css";

const PomoReport = ({ onClose, email }) => {
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [pomodoroData, setPomodoroData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const docRef = doc(db, "pomodoros", email); // email 기반 문서
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const rawData = docSnap.data(); // Firestore 데이터 가져오기
          const transformedData = transformData(rawData); // 데이터 변환
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
  }, [email]);

  // 데이터 변환 함수: "YYYY-MM-DD seconds" 형식을 분 단위로 변환
  const transformData = (rawData) => {
    const transformed = {};

    Object.entries(rawData).forEach(([date, seconds]) => {
      const [year, month, day] = date.split("-");
      const key = `${year}-${month}`; // 월별로 그룹화
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

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-btn" onClick={onClose}>
          ×
        </button>
        <div>
          <h1>Pomodoro Report</h1>
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
          <div className="bar-chart">
            {Array.from(
              { length: getDaysInMonth(currentYear, currentMonth) },
              (_, i) => i + 1
            ).map((day) => {
              const dayPomodoroMinutes = currentMonthData[day] || 0;
              return (
                <div key={day} className="bar-container">
                  <div
                    className="bar"
                    style={{ height: `${dayPomodoroMinutes * 10}px` }}
                  ></div>
                  <span className="bar-label">
                    {day}: {dayPomodoroMinutes} min
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default PomoReport;
