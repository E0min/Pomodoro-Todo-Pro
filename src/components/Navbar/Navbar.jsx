import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { auth } from "../../firebase/firebaseConfig";
import "./Navbar.css";
import PomoReport from "../PomoReport/PomoReport";

const Navbar = () => {
  const nav = useNavigate();
  const [user, setUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

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
      setUser(null);
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
          <div className="rank" data-tooltip="랭크 확인하기">
            Rank
          </div>
          <div
            className="report"
            onClick={() => setIsModalOpen(true)}
            data-tooltip="리포트 확인하기"
          >
            Report
          </div>

          {user ? (
            <div className="profile">
              <img
                onClick={handleLogout}
                src={user.photoURL}
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
    </>
  );
};

export default Navbar;
