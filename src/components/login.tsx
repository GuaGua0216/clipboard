// 你的檔案： src/components/login.tsx

import React, { useState } from 'react';
import { auth } from '../firebase/firebaseConfig';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { FirebaseError } from 'firebase/app';

// type LoginProps = {
//   onLoginSuccess: () => void;
// }

export default function Login() {
  // --- A. 狀態 ---
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // ⭐️ 1. 新增一個狀態來切換模式
  const [isLoginMode, setIsLoginMode] = useState(true); // 預設為 true (登入模式)

  // --- B. 主要提交函式 (會根據模式切換) ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    if (isLoginMode) {
      // --- 登入邏輯 ---
      try {
        await signInWithEmailAndPassword(auth, email, password);
        console.log('Firebase 登入成功！');
        // onLoginSuccess();
      } catch (error) {
        console.error("登入失敗:", error);
        let message = '登入失敗，請稍後再試。';
        if (error instanceof FirebaseError) {
          if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
            message = '電子郵件或密碼錯誤';
          }
        }
        setErrorMsg(message);
      } finally {
        setIsLoading(false);
      }
    } else {
      // --- 註冊邏輯 ---
      try {
        await createUserWithEmailAndPassword(auth, email, password);
        console.log('Firebase 註冊成功！');
        // onLoginSuccess(); // 註冊後直接登入
      } catch (error) {
        console.error("註冊失敗:", error);
        let message = '註冊失敗';
        if (error instanceof FirebaseError) {
          if (error.code === 'auth/weak-password') {
            message = '密碼強度不足 (至少 6 個字元)';
          } else if (error.code === 'auth/email-already-in-use') {
            message = '這個 Email 已經被註冊了';
          }
        }
        setErrorMsg(message);
      } finally {
        setIsLoading(false);
      }
    }
  }

  // --- C. Google 登入 (保持不變) ---
  const handleGoogleLogin = async () => {
    // ... (這裡的程式碼跟你原來的一樣，保持不變) ...
    setErrorMsg('');
    setIsLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      console.log('Google 登入成功！');
      // onLoginSuccess();
    } catch (error) {
      console.error("Google 登入失敗:", error);
      if (error instanceof FirebaseError && error.code !== 'auth/popup-closed-by-user') {
         setErrorMsg('Google 登入失敗');
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  // ⭐️ 2. 建立一個切換模式的輔助函式
  const toggleMode = () => {
    setIsLoginMode(!isLoginMode); // 反轉模式
    setErrorMsg(''); // 清除錯誤訊息
  }

  // --- D. 你的 JSX 介面 (已修改) ---
  return (
    <div className="max-w-md w-full mx-auto">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg">
        
        {/* ⭐️ 3. 標題和副標題根據模式改變 */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold">
            {isLoginMode ? '歡迎回來' : '建立您的帳號'}
          </h2>
          <p className="text-gray-400">
            {isLoginMode ? '請登入以繼續' : '請輸入資訊以註冊'}
          </p>
        </div>
        
        {/* ⭐️ 4. 表單現在統一由 handleSubmit 處理 
              (handleSubmit 內部會檢查 isLoginMode)
        */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex items-center">
            <label
              htmlFor="email"
              className="w-20 text-sm font-medium text-gray-300"
            >
              電子郵件
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="flex items-center">
            <label
              htmlFor="password"
              className="w-20 text-sm font-medium text-gray-300"
            >
              密碼
            </label>
            <input
              type="password"
              id="password"
              name="password"
              required
              className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition"
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {errorMsg && (
            <p className="text-red-500 text-sm text-center">{errorMsg}</p>
          )}

          <div>
            {/* ⭐️ 5. 主要按鈕的文字會根據模式改變 */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-300 mt-4 disabled:opacity-50"
            >
              {isLoading ? '處理中...' : (isLoginMode ? '登入' : '註冊')}
            </button>
          </div>
        </form>

        {/* 分隔線 */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-600" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-gray-800 text-gray-400">或者</span>
          </div>
        </div>
        
        {/* ⭐️ 6. 移除 "使用 Email 註冊" 按鈕,
              Google 登入按鈕保持不變
        */}
        <div className="space-y-4">
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors duration-300 disabled:opacity-50"
          >
            {isLoading ? '處理中...' : '使用 Google 登入'}
          </button>
        </div>

        {/* ⭐️ 7. 新增切換模式的文字連結 */}
        <div className="text-center mt-6">
          <button 
            type="button"
            onClick={toggleMode}
            className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
          >
            {isLoginMode 
              ? '還沒有帳號嗎？點此註冊' 
              : '已經有帳號了？點此登入'}
          </button>
        </div>

      </div>
    </div>
  )
}