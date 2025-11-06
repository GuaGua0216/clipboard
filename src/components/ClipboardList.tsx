import React from 'react';

// 1. 宣告你的 props 型別
type ClipboardListProps = {
  onLogout: () => void; // 接收一個叫做 onLogout 的函式
}

// 2. 讓組件接收 onLogout prop
export default function ClipboardList({ onLogout }: ClipboardListProps) {
    return (
        <div className="max-w-md w-full mx-auto">
            <div className="bg-gray-800 p-8 rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold text-center mb-4">Clipboard History</h2>
                <ul className="text-left">
                    {/* 這裡放你的剪貼簿內容 */}
                    <li className="p-2 border-b border-gray-700">Item 1</li>
                    <li className="p-2 border-b border-gray-700">Item 2</li>
                    <li className="p-2 border-b border-gray-700">Item 3</li>
                </ul>

                {/* 3. 加上登出按鈕 */}
                <button 
                  onClick={onLogout}
                  className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors duration-300 mt-6"
                >
                  登出
                </button>
            </div>
        </div>
    );
}