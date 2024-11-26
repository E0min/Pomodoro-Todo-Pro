// src/components/Rank.jsx

import React, { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig"; // Firebase 초기화 파일
import "./Rank.css"; // SCSS 파일로 스타일링

const Rank = ({ onClose }) => {
  const [rankedUsers, setRankedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getCurrentMonthKey = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    return `${year}-${month}`;
  };

  useEffect(() => {
    const fetchRankData = async () => {
      try {
        const pomodorosCollection = collection(db, "pomodoros");
        const pomodorosSnapshot = await getDocs(pomodorosCollection);

        const currentMonthKey = getCurrentMonthKey();
        const usersData = pomodorosSnapshot.docs.map((doc) => {
          const data = doc.data();

          // 현재 월 데이터만 필터링
          const totalSeconds = Object.entries(data)
            .filter(([date]) => date.startsWith(currentMonthKey)) // 현재 월의 날짜만 필터
            .reduce((sum, [, seconds]) => sum + seconds, 0); // 초 단위 합산

          const totalMinutes = Math.round(totalSeconds / 60);
          return {
            email: doc.id,
            totalMinutes,
          };
        });

        // 총 공부 시간 기준으로 내림차순 정렬
        const sortedUsers = usersData.sort(
          (a, b) => b.totalMinutes - a.totalMinutes
        );

        setRankedUsers(sortedUsers);
      } catch (err) {
        console.error("Error fetching rank data:", err);
        setError("Failed to fetch rank data.");
      } finally {
        setLoading(false);
      }
    };

    fetchRankData();
  }, []);

  // 분을 시간과 분으로 변환하는 헬퍼 함수
  const formatMinutes = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours > 0 ? `${hours}h ` : ""}${remainingMinutes}m`;
  };

  if (loading) {
    return (
      <div className="rank-container">
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rank-container">
        <p>{error}</p>
      </div>
    );
  }
  const getCurrentTearMonth = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    return `${year}년 ${month}월`;
  };
  const thismonth = getCurrentTearMonth();

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="rank-container">
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
          <h1>{thismonth} Study Time Rankings</h1>
          <table className="rank-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>User Email</th>
                <th>Total Study Time</th>
              </tr>
            </thead>
            <tbody>
              {rankedUsers.map((user, index) => (
                <tr key={user.email}>
                  <td>{index + 1}</td>
                  <td>{user.email}</td>
                  <td>{formatMinutes(user.totalMinutes)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Rank;
