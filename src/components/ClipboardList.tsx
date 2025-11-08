// 檔案： src/components/ClipboardList.tsx

import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';

// 1. 匯入 Firestore 相關函式和 db 物件
import { db } from '../firebase/firebaseConfig';
import { 
  collection, 
  query, 
  where, 
  onSnapshot,
  addDoc,
  serverTimestamp,
  orderBy,
  QueryDocumentSnapshot,
  DocumentData
} from 'firebase/firestore';

// 2. 定義剪貼簿項目的型別
type ClipItem = {
  id: string;
  text: string;
  createdAt: Date | null;
  userId: string;
}

// 3. Props 型別 (保持不變)
type ClipboardListProps = {
  onLogout: () => void;
  user: User;
}

export default function ClipboardList({ onLogout, user }: ClipboardListProps) {
    // 4. State (保持不變)
    const [items, setItems] = useState<ClipItem[]>([]);
    // const [newItem, setNewItem] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // 5. Firestore 集合參照 (保持不變)
    const itemsCollectionRef = collection(db, 'clipboards');

    // ⭐️ 6. 把「新增邏輯」抽成一個獨立函式
    //    (這樣「測試表單」和「剪貼簿監聽」才能共用)
    const addNewItemToFirestore = async (text: string) => {
      // 檢查一下，避免重複新增
      // (我們檢查 items state 中是否已有相同的*文字*)
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
        // (這裡可以選擇性地顯示錯誤，但可能會有點吵)
        // setError("自動新增剪貼簿失敗。");
      }
    };

    // ⭐️ 7. 你的第一個 useEffect (從 Firestore *讀取*)
    //    (這整段程式碼*保持原樣*，完全不用動！)
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
      
    }, [user.uid]); // 依賴 user.uid

    // ⭐️ 8. 「新增」的 useEffect (監聽 Electron)
    useEffect(() => {
      console.log('設定 Electron 剪貼簿監聽器...');
      
      // 呼叫我們在 preload.ts 和 electron-env.d.ts 建立的 API
      // 它會回傳一個「取消函式」
      const removeListener = window.electronAPI.onClipboardUpdate((_event, newText) => {
        // 收到來自 main.ts 的新文字！
        
        // 呼叫我們在步驟 6 抽出來的共用函式
        addNewItemToFirestore(newText);
      });

      // 在組件卸載 (unmount) 時，執行「取消函式」
      return () => {
        console.log('移除 Electron 剪貼簿監聽器');
        removeListener();
      };
      
    }, [user.uid, items]); // ⇐ 依賴 user.uid 和 items
    // (依賴 user.uid 確保登入後才監聽)
    // (依賴 items 確保 addNewItemToFirestore 能拿到最新的 items 列表來防重複)


    // ⭐️ 9. 修改「暫時的」表單提交函式
    // const handleAddItem = async (e: React.FormEvent) => {
    //   e.preventDefault();
    //   if (newItem.trim() === '') return;
      
    //   // 呼叫我們在步驟 6 抽出來的共用函式
    //   await addNewItemToFirestore(newItem); 
      
    //   setNewItem(''); // 清空 input
    // };

    // 10. JSX (保持不變)
    return (
        <div className="max-w-3xl w-full mx-auto">
            <div className="bg-gray-800 p-8 rounded-lg shadow-lg">
                <h2 className="text-xl font-bold text-center mb-1">Clipboard History</h2>
                <p className="text-center text-sm text-gray-400 mb-4">
                  歡迎，{user.email}
                </p>

                {/* 暫時的測試表單 */}
                {/* <form onSubmit={handleAddItem} className="flex gap-2 mb-4">
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
                </form> */}

                {/* 錯誤或載入狀態 */}
                {isLoading && <p className="text-center text-gray-400">載入資料中...</p>}
                {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                {/* 動態列表 */}
                <ul className="text-left max-h-60 overflow-y-auto border border-gray-700 rounded-lg">
                    {!isLoading && items.length === 0 && (
                      <li className="p-4 text-gray-500 text-center">你的雲端剪貼簿是空的</li>
                    )}
                    
                    {items.map(item => (
                        <li 
                          key={item.id} 
                          className="p-3 border-b border-gray-700 last:border-b-0"
                        >
                          {item.text}
                        </li>
                    ))}
                </ul>

                {/* 登出按鈕 */}
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