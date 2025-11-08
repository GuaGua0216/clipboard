import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';

// 1. 匯入 Firestore 相關函式和 db 物件
import { db } from '../firebase/firebaseConfig'; // ⇐ 確保路徑正確
import { 
  collection, 
  query, 
  where, 
  onSnapshot, // 用於即時監聽
  addDoc,     // 用於新增文件
  serverTimestamp, // 用於標記伺服器時間
  orderBy,    // 用於排序
  QueryDocumentSnapshot,
  DocumentData
} from 'firebase/firestore';

// 2. 定義剪貼簿項目的型別
type ClipItem = {
  id: string;      // 文件的 ID
  text: string;    // 剪貼簿的文字內容
  createdAt: Date | null; // 建立時間
  userId: string;  // 這是誰的項目
}

// 3. 更新 Props 型別 (接收 App.tsx 傳來的 user)
type ClipboardListProps = {
  onLogout: () => void;
  user: User;
}

export default function ClipboardList({ onLogout, user }: ClipboardListProps) {
    // 4. 建立 State
    const [items, setItems] = useState<ClipItem[]>([]); // 儲存從 Firestore 來的項目
    const [newItem, setNewItem] = useState(''); // ⇐ 這是我們「暫時的」測試輸入框
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // 5. 建立 Firestore 集合的參照
    // 'clipboards' 這個名稱必須對應到你安全規則中的名稱
    const itemsCollectionRef = collection(db, 'clipboards');

    // 6. 使用 useEffect 設定即時監聽
    // 這個 effect 會在 user.uid 載入後執行一次
    useEffect(() => {
      setError(null);
      
      // 建立一個查詢 (Query)
      // - 查詢 'clipboards' 集合
      // - 條件是 'userId' 欄位 === 目前登入者的 user.uid
      // - 依照 'createdAt' 欄位降序排列 (最新的在最上面)
      const q = query(
        itemsCollectionRef, 
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );

      // onSnapshot 會建立一個即時監聽器
      // 當資料庫符合這個 q 的資料有變動時，這個函式會自動觸發
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const firestoreItems: ClipItem[] = [];
        querySnapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
          const data = doc.data();
          firestoreItems.push({
            id: doc.id,
            text: data.text,
            // 將 Firestore 的 Timestamp 轉為 JavaScript 的 Date 物件
            createdAt: data.createdAt?.toDate() || null, 
            userId: data.userId,
          });
        });
        setItems(firestoreItems); // 更新 React 的 state，觸發畫面重繪
        setIsLoading(false);
      }, (err) => {
        // 處理錯誤
        console.error("Firestore 監聽失敗:", err);
        setError("無法載入資料。請確認 Firestore 安全規則是否已設定。");
        setIsLoading(false);
      });

      // 7. 組件卸載 (unmount) 時，取消監聽 (非常重要，避免記憶體洩漏)
      return () => unsubscribe();
      
    }, [user.uid]); // 依賴 user.uid，確保 user 載入後才執行

    // 8. 暫時的新增項目函式 (用來測試)
    const handleAddItem = async (e: React.FormEvent) => {
      e.preventDefault();
      if (newItem.trim() === '') return;

      try {
        // 呼叫 addDoc 新增文件到 'clipboards' 集合
        await addDoc(itemsCollectionRef, {
          text: newItem,
          userId: user.uid, // ⇐ 確保寫入 userId，安全規則才能運作
          createdAt: serverTimestamp() // ⇐ 使用伺服器時間，確保排序正確
        });
        setNewItem(''); // 清空 input
      } catch (err) {
        console.error("新增失敗:", err);
        setError("新增資料失敗。");
      }
    };

    // 9. 更新 JSX
    return (
        <div className="max-w-md w-full mx-auto">
            <div className="bg-gray-800 p-8 rounded-lg shadow-lg">
                <h2 className="text-xl font-bold text-center mb-1">Clipboard History</h2>
                {/* 顯示登入者的 Email */}
                <p className="text-center text-sm text-gray-400 mb-4">
                  歡迎，{user.email}
                </p>

                {/* ⭐️ 這是我們用來測試的「暫時表單」 ⭐️ */}
                <form onSubmit={handleAddItem} className="flex gap-2 mb-4">
                  <input
                    type="text"
                    value={newItem}
                    onChange={(e) => setNewItem(e.target.value)}
                    placeholder="輸入測試文字..."
                    className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition"
                  />
                  <button type="submit" className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                    新增
                  </button>
                </form>

                {/* 顯示錯誤或載入狀態 */}
                {isLoading && <p className="text-center text-gray-400">載入資料中...</p>}
                {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                {/* ⭐️ 動態列表 ⭐️ */}
                <ul className="text-left max-h-60 overflow-y-auto border border-gray-700 rounded-lg">
                    {!isLoading && items.length === 0 && (
                      <li className="p-4 text-gray-500 text-center">你的雲端剪貼簿是空的</li>
                    )}
                    
                    {/* 使用 map 將 items state 渲染成 <li> */}
                    {items.map(item => (
                        <li 
                          key={item.id} 
                          className="p-3 border-b border-gray-700 last:border-b-0"
                        >
                          {/* (你之後可以在這裡加上刪除按鈕)
                            <button onClick={() => deleteItem(item.id)}>X</button> 
                          */}
                          {item.text}
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