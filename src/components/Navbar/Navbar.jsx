
import React, { useEffect, useState } from "react";
import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { auth } from "../../firebase/firebaseConfig"; // Firebase 초기화 파일 경로에 맞게 설정
import "./Navbar.css";
const Navbar = () => {
  const [user, setUser] = useState(null); // 로그인된 사용자 상태
  // 로그인 상태 감지
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser); // 로그인된 사용자 정보 설정
    });
    return () => unsubscribe(); // 컴포넌트 언마운트 시 리스너 제거
  }, []);

  // Google 로그인
  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("로그인 실패:", error.message);
    }
  };

  // 로그아웃
  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null); // 사용자 상태 초기화
    } catch (error) {
      console.error("로그아웃 실패:", error.message);
    }
  };

  return (
    <>
      <nav>
        <div className="Pomo-Todo" data-tooltip="메인 화면으로 이동" onClick={() => nav('/')}>Pomo-todo</div>

        <div>
          <div className="rank" data-tooltip="랭크 확인하기">Rank</div>
          <div className="report" data-tooltip="리포트 확인하기">Report</div>

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
            <button onClick={handleLogin}>Google로 계속하기</button>
          )}
        </div>
      </nav>
    </>
  );
};

export default Navbar;
