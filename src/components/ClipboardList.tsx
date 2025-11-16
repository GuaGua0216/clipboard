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
  DocumentData,
  doc,         // ⭐️ 新增：用於指定單一文件
  deleteDoc    // ⭐️ 新增：用於刪除文件
} from 'firebase/firestore';
import { ClipboardDocumentIcon, TrashIcon, CheckIcon } from '@heroicons/react/24/outline';

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
  isDarkMode: boolean;
}

export default function ClipboardList({ onLogout, user, isDarkMode }: ClipboardListProps) {
    // 4. State (保持不變)
    const [items, setItems] = useState<ClipItem[]>([]);
    // const [newItem, setNewItem] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // ⭐️ 6. 新增一個 state 來追蹤哪個項目被複製了
    const [copiedItemId, setCopiedItemId] = useState<string | null>(null);

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
// ⭐️ 9. 新增：複製功能的函式
    // (我們使用瀏覽器內建的剪貼簿 API)
    const handleCopy = (id: string, text: string) => {
      navigator.clipboard.writeText(text)
        .then(() => {
          console.log('已複製到剪貼簿:', text);
          // 這裡您可以選擇性地加入一個 "已複製！" 的提示
        })
        .catch(err => {
          console.error('複製失敗:', err);
        });navigator.clipboard.writeText(text)
        .then(() => {
          console.log('已複製到剪貼簿:', text);
          // 設定 ID，觸發打勾圖示
          setCopiedItemId(id);
          // 2 秒後自動移除打勾
          setTimeout(() => {
            setCopiedItemId(null);
          }, 2000);
        })
        .catch(err => {
          console.error('複製失敗:', err);
        });
    };

    // ⭐️ 10. 新增：刪除功能的函式
    const handleDelete = async (id: string) => {
      // 為了安全起見，您可以取消註解下面這行來增加確認步驟
      // if (!confirm('確定要刪除這筆紀錄嗎？')) return;

      console.log('刪除項目:', id);
      try {
        // 建立指向特定 ID 文件的參照
        const itemDocRef = doc(db, 'clipboards', id);
        // 呼叫 deleteDoc
        await deleteDoc(itemDocRef);
      } catch (err) {
        console.error("刪除失敗:", err);
        setError("刪除項目失敗。");
      }
    };



    // 10. JSX (保持不變)
    const panelTone = isDarkMode ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-900';
    const subText = isDarkMode ? 'text-gray-400' : 'text-gray-600';
    const borderTone = isDarkMode ? 'border-gray-700' : 'border-gray-200';
    const listDivider = isDarkMode ? 'border-gray-700' : 'border-gray-200';
    const copyButton = isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-blue-700';
    const logoutButton = isDarkMode
      ? 'bg-gray-700 text-white hover:bg-gray-600'
      : 'bg-blue-200 text-blue-900 hover:bg-blue-300 border border-blue-300';

    return (
        <div className="max-w-3xl w-full mx-auto">
            <div className={`p-8 rounded-lg shadow-lg ${panelTone}`}>
                <h2 className="text-xl font-bold text-center mb-1">Clipboard History</h2>
                <p className={`text-center text-sm mb-4 ${subText}`}>
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

                {/* ⭐️ 14. 修改動態列表的 JSX 佈局 */}
                <ul className={`text-left max-h-60 overflow-y-auto border rounded-lg ${borderTone}`}>
                    {!isLoading && items.length === 0 && (
                      <li className={`p-4 text-center ${subText}`}>你的雲端剪貼簿是空的</li>
                    )}
                    
                    {items.map(item => (
                        <li 
                          key={item.id} 
                          // (A) 保持 Flex 佈局，justify-between 會把左右推開
                          className={`flex items-center justify-between p-3 border-b last:border-b-0 ${listDivider}`}
                        >
                          {/* (B) 左側群組 (複製按鈕 + 文字) */}
                          {/* 'flex-1' 和 'min-w-0' 是為了確保文字截斷(truncate)能正常運作 */}
                          <div className="flex items-center flex-1 min-w-0">
                            
                            {/* 複製/打勾 按鈕 (最左邊) */}
                            <div className="flex-shrink-0 w-5 h-5 mr-3">
                              {copiedItemId === item.id ? (
                                // 顯示打勾
                                <CheckIcon className="w-5 h-5 text-green-500" />
                              ) : (
                                // 顯示複製按鈕
                                <button
                                  onClick={() => handleCopy(item.id, item.text)}
                                  className={`p-0 transition-colors ${copyButton}`}
                                  title="複製"
                                >
                                  <ClipboardDocumentIcon className="w-5 h-5" />
                                </button>
                              )}
                            </div>
                            
                            {/* 文字 (中間) */}
                            <span className="truncate" title={item.text}>
                              {item.text}
                            </span>
                          </div>

                          {/* (C) 刪除按鈕 (最右邊) */}
                          <div className="flex-shrink-0 ml-2">
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="p-1 text-red-500 hover:text-red-400 transition-colors"
                              title="刪除"
                            >
                              <TrashIcon className="w-5 h-5" />
                            </button>
                          </div>
                        </li>
                    ))}
                </ul>

                {/* 登出按鈕 */}
                <button 
                  onClick={onLogout}
                  className={`w-full py-2 px-4 rounded-lg transition-colors duration-300 mt-6 ${logoutButton}`}
                >
                  登出
                </button>
            </div>
        </div>
    );
}
