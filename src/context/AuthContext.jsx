import React, { createContext, useContext, useState, useEffect } from "react";
import { auth } from "../firebase/firebaseConfig"; // Firebase 설정 파일
import { onAuthStateChanged } from "firebase/auth";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null); // 사용자 상태
  const [loading, setLoading] = useState(true); // 로딩 상태

  useEffect(() => {
    // Firebase Auth 상태 변화 감지
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser({
          uid: user.uid,
          email: user.email,
          photoURL: user.photoURL,
          displayName: user.displayName,
        });
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe(); // 컴포넌트 unmount 시 정리
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Context를 쉽게 사용할 수 있는 Custom Hook
export const useAuth = () => {
  return useContext(AuthContext);
};
