// 檔案： src/components/login.tsx
// ⭐️ 這是「合併版」：
// 1. 移除了 onLoginSuccess prop
// 2. 加入了 登入/註冊 切換模式 (修正 UX)
// 3. 整合了你的 深色模式 Tailwind class

import React, { useState } from 'react';
import { auth } from '../firebase/firebaseConfig';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { FirebaseError } from 'firebase/app';

// 你原本的 Props (用於通知父組件登入成功)
// 你原本的 Props (用於通知父組件登入成功)
// type LoginProps = {
//   onLoginSuccess: () => void;
// }
type LoginProps = { isDarkMode: boolean } // 依據 App 的主題狀態切換樣式

// export default function Login({ onLoginSuccess }: LoginProps) {
export default function Login({ isDarkMode }: LoginProps) {
  // --- A. 加入 State ---
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // 新增一個狀態來切換模式
  const [isLoginMode, setIsLoginMode] = useState(true); // 預設為 true (登入模式)

  const cardTone = isDarkMode
    ? 'bg-blue-950 text-gray-100'
    : 'bg-blue-100 text-gray-800';
  const labelTone = isDarkMode ? 'text-gray-300' : 'text-gray-700';
  const inputTone = isDarkMode
    ? 'bg-gray-700 border-gray-600 text-gray-100 focus:ring-blue-500 focus:border-blue-500'
    : 'bg-white border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500';
  const primaryButtonTone = isDarkMode
    ? 'from-blue-500 to-blue-400 text-white hover:from-blue-600 hover:to-blue-500'
    : 'from-blue-200 to-blue-100 text-blue-900 hover:from-blue-300 hover:to-blue-200';
  const signupTone = isDarkMode
    ? 'bg-blue-900 text-blue-100 hover:bg-blue-800'
    : 'bg-blue-100 text-blue-900 hover:bg-blue-200 border border-blue-200';

  // --- B. Email/Password 登入 (你原本的 handleSubmit) ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    try {
      // 呼叫 Firebase 的 Email/Password 登入
      await signInWithEmailAndPassword(auth, email, password);
      console.log('Firebase 登入成功！');
      // onLoginSuccess(); // 呼叫 prop
    } catch (error) {
      console.error("登入失敗:", error);
      let message = '登入失敗，請稍後再試。';
      if (error instanceof FirebaseError) {
        if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
          message = '電子郵件或密碼錯誤';
        }
        setErrorMsg(message);
      } finally {
        setIsLoading(false);
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
      // onLoginSuccess(); // 註冊後通常也會直接登入
    } catch (error) {
      console.error("註冊失敗:", error);
      let message = '註冊失敗';
      if (error instanceof FirebaseError) {
        if (error.code === 'auth/weak-password') {
          message = '密碼強度不足 (至少 6 個字元)';
        } else if (error.code === 'auth/email-already-in-use') {
          message = '這個 Email 已經被註冊了';
        }
        setErrorMsg(message);
      } finally {
        setIsLoading(false);
      }
    }
  }

  // --- C. Google 登入 ---
  const handleGoogleLogin = async () => {
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
  
  // 切換模式的輔助函式
  const toggleMode = () => {
    setIsLoginMode(!isLoginMode); // 反轉模式
    setErrorMsg(''); // 清除錯誤訊息
  }

  // --- D. 你的 JSX 介面 (已修改) ---
  return (
    <div className="max-w-md w-full mx-auto">
      <div className={`p-8 rounded-xl shadow-2xl transition-colors duration-300 ${cardTone}`}>
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold">歡迎回來</h2>
          <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>請登入以繼續</p>
        </div>
        
        {/* 表單統一由 handleSubmit 處理 */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex items-center">
            <label
              htmlFor="email"
              className={`w-20 text-sm font-medium ${labelTone}`}
            >
              電子郵件
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              className={`flex-1 px-4 py-2 rounded-lg transition ${inputTone}`}
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="flex items-center">
            <label
              htmlFor="password"
              className={`w-20 text-sm font-medium ${labelTone}`}
            >
              密碼
            </label>
            <input
              type="password"
              id="password"
              name="password"
              required
              className={`flex-1 px-4 py-2 rounded-lg transition ${inputTone}`}
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {errorMsg && (
            <p className="text-red-500 text-sm text-center">{errorMsg}</p>
          )}

          <div>
            {/* 主要按鈕的文字會根據模式改變 */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-2 px-4 rounded-lg shadow font-bold bg-gradient-to-r focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400 transition-all duration-200 mt-4 disabled:opacity-50 ${primaryButtonTone}`}
            >
              {isLoading ? '處理中...' : (isLoginMode ? '登入' : '註冊')}
            </button>
          </div>
        </form>

        {/* 分隔線 */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-400 dark:border-gray-600" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-blue-100 dark:bg-blue-950 text-gray-500 dark:text-gray-400">
              或者
            </span>
          </div>
        </div>
        
        {/* Google 登入按鈕 */}
        <div className="space-y-4">
          <button
            type="button"
            onClick={handleSignUp}
            disabled={isLoading}
            className={`w-full py-2 px-4 rounded-lg shadow font-bold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400 dark:focus:ring-blue-900 transition-all duration-200 disabled:opacity-50 ${signupTone}`}
          >
            {isLoading ? '處理中...' : '使用 Email 註冊'}
          </button>
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isLoading}
            // ⭐️ 整合你的深色模式 class
            className="w-full py-2 px-4 rounded-lg shadow font-bold bg-white text-gray-700 hover:bg-gray-100 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300 dark:focus:ring-gray-700 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <svg className="w-5 h-5" viewBox="0 0 48 48"><g><path fill="#4285F4" d="M24 9.5c3.54 0 6.73 1.22 9.24 3.22l6.9-6.9C36.62 2.34 30.7 0 24 0 14.73 0 6.41 5.48 2.44 13.44l8.06 6.27C12.6 13.16 17.87 9.5 24 9.5z"/><path fill="#34A853" d="M46.1 24.59c0-1.64-.15-3.22-.42-4.76H24v9.04h12.44c-.54 2.77-2.18 5.12-4.64 6.7l7.18 5.59C43.98 36.7 46.1 30.98 46.1 24.59z"/><path fill="#FBBC05" d="M10.5 28.73c-1.01-2.97-1.01-6.19 0-9.16l-8.06-6.27C.64 16.7 0 20.26 0 24c0 3.74.64 7.3 2.44 10.7l8.06-6.27z"/><path fill="#EA4335" d="M24 48c6.7 0 12.62-2.2 16.9-6.01l-7.18-5.59c-2.01 1.35-4.59 2.15-7.72 2.15-6.13 0-11.4-3.66-13.5-8.94l-8.06 6.27C6.41 42.52 14.73 48 24 48z"/></g></svg>
            {isLoading ? '處理中...' : '使用 Google 登入'}
          </button>
        </div>

        {/* 新增切換模式的文字連結 */}
        <div className="text-center mt-6">
          <button 
            type="button"
            onClick={toggleMode}
            className="text-sm text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 transition-colors"
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
