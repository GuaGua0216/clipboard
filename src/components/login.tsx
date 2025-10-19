import React from 'react'
import tailwindcss from '@tailwindcss/vite'

type LoginProps = {
  onLoginSuccess: () => void; // ⇐ 聲明接收這個 prop
}

export default function Login({ onLoginSuccess }: LoginProps) {
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    alert('模擬登入成功！')
    onLoginSuccess()
  }
  return (
   
      <div className="max-w-md w-full mx-auto">
        <div className="bg-gray-800 p-8 rounded-lg shadow-lg">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold">歡迎回來</h2>
            <p className="text-gray-400">請登入以繼續</p>
          </div>
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
              />
            </div>
            <div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-300 mt-4"
              >
                登入
              </button>
            </div>
          </form>
        </div>
      </div>
  )
}