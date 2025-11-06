// 你的檔案： src/firebase/Login.tsx (或你放的路徑)

import React from 'react'
// 1. 匯入 useState
import { useState } from 'react';

// 2. 從你的設定檔匯入 auth
import { auth } from '../firebase/firebaseConfig'; // 確保 @/ 路徑是正確的

// 3. 匯入 Firebase Auth 的相關函式
import {

  // Email/Password
  createUserWithEmailAndPassword, // 註冊
  signInWithEmailAndPassword,   // 登入

  // Google
  GoogleAuthProvider,
  signInWithPopup,

} from "firebase/auth";
  // (可選) 處理錯誤
import { FirebaseError } from 'firebase/app';

// 你原本的 Props (用於通知父組件登入成功)
// 你原本的 Props (用於通知父組件登入成功)
type LoginProps = {
  onLoginSuccess: () => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  // --- A. 加入 State ---
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState(''); // 用來顯示 Firebase 錯誤
  const [isLoading, setIsLoading] = useState(false); // 增加讀取狀態

  // --- B. Email/Password 登入 (你原本的 handleSubmit) ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    try {
      // 呼叫 Firebase 的 Email/Password 登入
      await signInWithEmailAndPassword(auth, email, password);
      console.log('Firebase 登入成功！');
      onLoginSuccess(); // 呼叫 prop
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
  }

  // --- C. Email/Password 註冊 ---
  const handleSignUp = async () => {
    setErrorMsg('');
    setIsLoading(true);
    try {
      // 呼叫 Firebase 的註冊
      await createUserWithEmailAndPassword(auth, email, password);
      console.log('Firebase 註冊成功！');
      onLoginSuccess(); // 註冊後通常也會直接登入
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
  };

  // --- D. Google 登入 ---
  const handleGoogleLogin = async () => {
    setErrorMsg('');
    setIsLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      console.log('Google 登入成功！');
      onLoginSuccess();
    } catch (error) {
      console.error("Google 登入失敗:", error);
      // 如果不是使用者主動關閉視窗，才顯示錯誤
      if (error instanceof FirebaseError && error.code !== 'auth/popup-closed-by-user') {
         setErrorMsg('Google 登入失敗');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // --- E. 你的 JSX 介面 ---
  return (
    <div className="max-w-md w-full mx-auto">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold">歡迎回來</h2>
          <p className="text-gray-400">請登入以繼續</p>
        </div>
        
        {/* 主要登入表單 */}
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

          {/* 顯示錯誤訊息的地方 */}
          {errorMsg && (
            <p className="text-red-500 text-sm text-center">{errorMsg}</p>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-300 mt-4 disabled:opacity-50"
            >
              {isLoading ? '處理中...' : '登入'}
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
        
        {/* 新增的註冊與 Google 登入按鈕 */}
        <div className="space-y-4">
          <button
            type="button" // 注意：type="button" 才不會觸發 form submit
            onClick={handleSignUp}
            disabled={isLoading}
            className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors duration-300 disabled:opacity-50"
          >
            {isLoading ? '處理中...' : '使用 Email 註冊'}
          </button>
          
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors duration-300 disabled:opacity-50"
          >
            {isLoading ? '處理中...' : '使用 Google 登入'}
          </button>
        </div>

      </div>
    </div>
  )
}