import React, { useState } from "react";
import "./PomoReport.css";

const PomoReport = () => {
  const [selectedDate, setSelectedDate] = useState(null); // 선택된 날짜 상태

  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const firstDay = new Date(year, month, 1).getDay(); // 첫 번째 날의 요일
  const daysInMonth = new Date(year, month + 1, 0).getDate(); // 이번 달의 총 일수

  const handleDateClick = (day) => {
    setSelectedDate(`${year}-${month + 1}-${day}`);
  };

  return (
    <>
    <div className="report-container">
      <h1>Pomodoro Report</h1>
      <div className="calendar">
        <div className="calendar-header">
          <h2>{`${year}-${String(month + 1).padStart(2, "0")}`}</h2>
        </div>
        <div className="calendar-days">
          {days.map((day) => (
            <div key={day} className="day-name">
              {day}
            </div>
          ))}
        </div>
        <div className="calendar-dates">
          {/* 빈 공간 추가 */}
          {Array.from({ length: firstDay }).map((_, index) => (
            <div key={`empty-${index}`} className="empty"></div>
          ))}
          {/* 날짜 표시 */}
          {Array.from({ length: daysInMonth }).map((_, index) => {
            const day = index + 1;
            return (
              <div
                key={day}
                className={`date ${
                  selectedDate === `${year}-${month + 1}-${day}` ? "selected" : ""
                }`}
                onClick={() => handleDateClick(day)}
              >
                {day}
              </div>
            );
          })}
        </div>
      </div>
      {selectedDate && <h2>Selected Date: {selectedDate}</h2>}
    </div>
    </>
    
  );
};

export default PomoReport;
