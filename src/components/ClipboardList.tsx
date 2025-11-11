// 檔案： src/components/ClipboardList.tsx
// ⭐️ 這是使用「Heroicons」的最終版 ⭐️

import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { db } from '../firebase/firebaseConfig';
import { 
  collection, query, where, onSnapshot, addDoc, 
  serverTimestamp, orderBy, QueryDocumentSnapshot, 
  DocumentData, doc, deleteDoc
} from 'firebase/firestore';

// 1. ⭐️ 從 Heroicons 匯入我們需要的圖示
import { ClipboardIcon, TrashIcon, CheckIcon } from '@heroicons/react/24/outline';


// --- 型別定義 (保持不變) ---
type ClipItem = {
  id: string;
  text: string;
  createdAt: Date | null;
  userId: string;
}
type ClipboardListProps = {
  onLogout: () => void;
  user: User;
}

export default function ClipboardList({ onLogout, user }: ClipboardListProps) {
    // --- State (保持不變) ---
    const [items, setItems] = useState<ClipItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const itemsCollectionRef = collection(db, 'clipboards');

    // --- 所有函式 (addNewItemToFirestore, handleDeleteItem, handleCopyItem) ---
    // --- 和所有 useEffect (讀取 Firestore, 監聽 Electron) ---
    // --- (全部保持不變，你不需要修改它們) ---
    
    // ... (addNewItemToFirestore 函式) ...
    const addNewItemToFirestore = async (text: string) => {
      if (items.find(item => item.text === text)) {
        console.log("項目已存在，跳過新增:", text);
        return;
      }
      console.log("從剪貼簿新增項目到 Firestore:", text);
      try {
        await addDoc(itemsCollectionRef, {
          text: text,
          userId: user.uid,
          createdAt: serverTimestamp()
        });
      } catch (err) {
        console.error("自動新增失敗:", err);
      }
    };
    
    // ... (handleDeleteItem 函式) ...
    const handleDeleteItem = async (id: string) => {
      console.log("正在刪除:", id);
      try {
        const itemDocRef = doc(db, 'clipboards', id);
        await deleteDoc(itemDocRef);
      } catch (err) {
        console.error("刪除失敗:", err);
        setError("刪除項目失敗。");
      }
    };

    // ... (handleCopyItem 函式) ...
    const handleCopyItem = async (id: string, text: string) => {
      try {
        await navigator.clipboard.writeText(text);
        setCopiedId(id);
        console.log("已複製:", text);
        setTimeout(() => {
          setCopiedId(null);
        }, 1500);
      } catch (err) {
        console.error("複製失敗:", err);
        setError("複製到剪貼簿失敗。");
      }
    };
    
    // ... (useEffect - 讀取 Firestore) ...
    useEffect(() => {
      setError(null);
      const q = query(
        itemsCollectionRef, 
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const firestoreItems: ClipItem[] = [];
        querySnapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
          const data = doc.data();
          firestoreItems.push({
            id: doc.id,
            text: data.text,
            createdAt: data.createdAt?.toDate() || null, 
            userId: data.userId,
          });
        });
        setItems(firestoreItems); 
        setIsLoading(false);
      }, (err) => {
        console.error("Firestore 監聽失敗:", err);
        setError("無法載入資料。請確認 Firestore 安全規則是否已設定。");
        setIsLoading(false);
      });
      return () => unsubscribe();
    }, [user.uid]);
    
    // ... (useEffect - 監聽 Electron) ...
    useEffect(() => {
      console.log('設定 Electron 剪貼簿監聽器...');
      const removeListener = window.electronAPI.onClipboardUpdate((_event, newText) => {
        addNewItemToFirestore(newText);
      });
      return () => {
        console.log('移除 Electron 剪貼簿監聽器');
        removeListener();
      };
    }, [user.uid, items]);

    
    // --- 2. ⭐️ 介面 (JSX) - 已修改成使用 Heroicons ⭐️ ---
    return (
        <div className="max-w-2xl w-full mx-auto"> 
            <div className="bg-gray-800 p-8 rounded-lg shadow-lg">
                <h2 className="text-xl font-bold text-center mb-1">Clipboard History</h2>
                <p className="text-center text-sm text-gray-400 mb-4">
                  歡迎，{user.email}
                </p>

                {/* 錯誤或載入狀態 */}
                {isLoading && <p className="text-center text-gray-400">載入資料中...</p>}
                {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                {/* 動態列表 */}
                <ul className="text-left max-h-96 overflow-y-auto border border-gray-700 rounded-lg">
                    {!isLoading && items.length === 0 && (
                      <li className="p-4 text-gray-500 text-center">你的雲端剪貼簿是空的</li>
                    )}
                    
                    {items.map(item => (
                        <li 
                          key={item.id} 
                          className="flex items-center justify-between gap-3 p-2.5 border-b border-gray-700 last:border-b-0"
                        >
                          {/* --- 左邊：複製按鈕 (已換成 Heroicon) --- */}
                          <button
                            type="button"
                            onClick={() => handleCopyItem(item.id, item.text)}
                            // 我們可以直接用 Tailwind class 調整圖示顏色！
                            className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 transition-all duration-200 disabled:opacity-100"
                            aria-label="Copy"
                            disabled={copiedId === item.id}
                          >
                            {/* 根據 copiedId 顯示「打勾」或「複製」圖示 */}
                            {copiedId === item.id ? (
                              <CheckIcon className="w-5 h-5 text-green-400" />
                            ) : (
                              <ClipboardIcon className="w-5 h-5" />
                            )}
                          </button>

                          {/* --- 中間：文字 (保持不變) --- */}
                          <span 
                            className="flex-1 text-left truncate" 
                            title={item.text}
                          >
                            {item.text}
                          </span>
                          
                          {/* --- 右邊：刪除按鈕 (已換成 Heroicon) --- */}
                          <button
                            type="button"
                            onClick={() => handleDeleteItem(item.id)}
                            className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-500 hover:bg-gray-700 transition-all duration-200"
                            aria-label="Delete"
                          >
                            <TrashIcon className="w-5 h-5" />
                          </button>
                        </li>
                    ))}
                </ul>

                {/* 登出按鈕 (保持不變) */}
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