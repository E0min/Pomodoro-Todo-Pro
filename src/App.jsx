import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import HomePage from "./pages/HomePage";
import "./App.css";

// React Router 설정
const router = createBrowserRouter([{ path: "/", element: <HomePage /> }], {
  future: {
    v7_startTransition: true, // React.startTransition 사용
    v7_relativeSplatPath: true, // 상대 경로 계산 변경
  },
});

const App = () => {
  return <RouterProvider router={router} />;
};

export default App;
