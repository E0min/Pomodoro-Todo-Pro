// src/firebase/pomodoroUtils.js
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "./firebaseConfig";

/**
 * Pomodoro 누적 시간을 Firestore에 저장 또는 업데이트.
 * @param {number} elapsedTime - 경과 시간 (초 단위)
 */
export const savePomodoroTime = async (elapsedTime) => {
  try {
    const user = auth.currentUser;
    if (!user) {
      console.error("로그인이 필요합니다.");
      return;
    }

    const userRef = doc(db, "users", user.uid, "pomodoro", "totalTime");

    const docSnap = await getDoc(userRef);
    if (docSnap.exists()) {
      // 기존 데이터가 있으면 업데이트
      await updateDoc(userRef, {
        totalTime: docSnap.data().totalTime + elapsedTime,
      });
    } else {
      // 새로운 데이터 추가
      await setDoc(userRef, {
        totalTime: elapsedTime,
      });
    }

    console.log("Pomodoro 누적 시간이 성공적으로 저장되었습니다.");
  } catch (error) {
    console.error("Pomodoro 시간 저장 중 오류 발생:", error);
  }
};

/**
 * Firestore에서 Pomodoro 누적 시간을 가져옴.
 * @returns {Promise<number>} - 누적 시간 (초 단위)
 */
export const getPomodoroTime = async () => {
  try {
    const user = auth.currentUser;
    if (!user) {
      console.error("로그인이 필요합니다.");
      return 0;
    }

    const userRef = doc(db, "users", user.uid, "pomodoro", "totalTime");
    const docSnap = await getDoc(userRef);

    if (docSnap.exists()) {
      return docSnap.data().totalTime;
    } else {
      return 0; // 데이터가 없으면 0 반환
    }
  } catch (error) {
    console.error("Pomodoro 시간 가져오기 중 오류 발생:", error);
    return 0;
  }
};
