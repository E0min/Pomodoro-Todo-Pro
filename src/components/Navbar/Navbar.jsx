import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { auth } from "../../firebase/firebaseConfig";
import { useAuth } from "../../context/AuthContext"; // AuthContext에서 useAuth 가져오기
import "./Navbar.css";
import PomoReport from "../PomoReport/PomoReport";
import Rank from "../Rank/Rank";

const Navbar = () => {
  const nav = useNavigate();
  const { currentUser } = useAuth(); // Context에서 로그인 상태 가져오기
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRankModalOpen,setIsRankModalOpen] = useState(false);

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("로그인 실패:", error.message);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("로그아웃 실패:", error.message);
    }
  };

  return (
    <>
      <nav>
        <div
          className="Pomo-Todo"
          data-tooltip="메인 화면으로 이동"
          onClick={() => nav("/")}
        >
          Pomo-todo
        </div>

        <div>
          <div className="rank" data-tooltip="랭크 확인하기" onClick={()=>isRankModalOpen===false?setIsRankModalOpen(true):setIsRankModalOpen(false)}>
            Rank
          </div>

          {/* Report 버튼 */}
          <div
            className={`report ${!currentUser ? "disabled" : ""}`} // 비활성화 시 스타일 추가
            onClick={currentUser ? () => setIsModalOpen(true) : undefined} // 조건부 클릭 이벤트
            data-tooltip={!currentUser ? "로그인 후 이용 가능" : "리포트 확인하기"} // 툴팁 변경
          >
            Report
          </div>

          {/* 로그인/로그아웃 */}
          {currentUser ? (
            <div className="profile">
              <img
                onClick={handleLogout}
                src={currentUser.photoURL}
                alt="프로필 사진"
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  objectFit: "cover",
                }}
              />
            </div>
          ) : (
            <div
              className="google-btn"
              data-tooltip="로그인 하려면 클릭"
              onClick={handleLogin}
            >
              Google로 계속하기
            </div>
          )}
        </div>
      </nav>

      {isModalOpen && <PomoReport onClose={() => setIsModalOpen(false)} />}
      {isRankModalOpen && <Rank onClose={() => setIsRankModalOpen(false)} />}

    </>
  );
};

export default Navbar;
