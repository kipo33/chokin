import { useState, useEffect } from 'react'
import SavingsGoal from './components/SavingsGoal'
import SavingsDots from './components/SavingsDots'
import Auth from './components/Auth'
import { supabase } from './supabase'
import {
  getUserSavingsGoal,
  getUserSavedAmount,
  setUserSavingsGoal,
  updateUserSavedAmount,
  resetUserSavings
} from './services/savingsService'

function App() {
  // 認証状態
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // デフォルトの目標金額: 1000万円
  const [targetAmount, setTargetAmount] = useState<number>(10000000);
  
  // 現在の貯金額
  const [currentAmount, setCurrentAmount] = useState<number>(0);

  // Supabase接続の確認（開発用）
  useEffect(() => {
    console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL ? '設定済み' : '未設定');
    console.log('Supabase Key:', import.meta.env.VITE_SUPABASE_ANON_KEY ? '設定済み' : '未設定');
  }, []);

  // 現在のセッションをチェック
  useEffect(() => {
    const checkSession = async () => {
      setIsLoading(true);
      const { data } = await supabase.auth.getSession();
      
      if (data?.session?.user) {
        setUserId(data.session.user.id);
        await loadUserData(data.session.user.id);
      } else {
        // 未ログインの場合はローカルストレージから読み込む（互換性維持）
        const savedAmount = localStorage.getItem('savings-amount');
        if (savedAmount) {
          setCurrentAmount(parseInt(savedAmount));
        }
      }
      
      setIsLoading(false);
    };
    
    checkSession();
    
    // 認証状態の変更を監視
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          setUserId(session.user.id);
          await loadUserData(session.user.id);
        } else if (event === 'SIGNED_OUT') {
          setUserId(null);
          setCurrentAmount(0);
          setTargetAmount(10000000);
        }
      }
    );
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);
  
  // ユーザーデータの読み込み
  const loadUserData = async (id: string) => {
    // 目標金額の取得
    const goal = await getUserSavingsGoal(id);
    if (goal !== null) {
      setTargetAmount(goal);
    } else {
      // 目標金額がなければデフォルト値を設定
      await setUserSavingsGoal(id, targetAmount);
    }
    
    // 現在の貯金額を取得
    const saved = await getUserSavedAmount(id);
    if (saved !== null) {
      setCurrentAmount(saved);
    }
  };
  
  // ログイン処理
  const handleLogin = async (id: string) => {
    setUserId(id);
    await loadUserData(id);
  };
  
  // ログアウト処理
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUserId(null);
    setCurrentAmount(0);
  };
  
  // 目標金額の変更処理
  const handleTargetChange = async (newTarget: number) => {
    setTargetAmount(newTarget);
    
    if (userId) {
      await setUserSavingsGoal(userId, newTarget);
    }
  };
  
  // 貯金額の更新処理
  const handleSavingsUpdate = async (amount: number) => {
    const newAmount = Math.max(0, currentAmount + amount);
    setCurrentAmount(newAmount);
    
    if (userId) {
      // Supabaseに保存
      await updateUserSavedAmount(userId, newAmount);
    } else {
      // 未ログインの場合はローカルストレージに保存（互換性維持）
      localStorage.setItem('savings-amount', newAmount.toString());
    }
  };

  // リセット処理
  const handleReset = async () => {
    if (window.confirm('本当にリセットしますか？全ての貯金データが消去されます。')) {
      // 貯金額をリセット
      setCurrentAmount(0);
      
      if (userId) {
        // Supabaseのデータをリセット
        await resetUserSavings(userId);
      } else {
        // 未ログインの場合はローカルストレージをクリア
        localStorage.removeItem('savings-amount');
        localStorage.removeItem('savings-dots');
      }
    }
  };

  // ローディング中の表示
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-lg">読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="bg-green-50 py-6 border-b-2 border-secondary">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl font-bold text-primary mb-2">元本積立アプリ</h1>
          <p className="text-gray-600">目標達成まで一緒に頑張りましょう！</p>
          
          {userId && (
            <div className="mt-2 flex justify-center">
              <button 
                onClick={handleLogout}
                className="text-sm bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded"
              >
                ログアウト
              </button>
            </div>
          )}
        </div>
      </header>
      
      <main className="flex-1 container mx-auto px-4 py-6">
        {userId ? (
          <>
            <SavingsGoal 
              currentAmount={currentAmount} 
              targetAmount={targetAmount} 
              onTargetChange={handleTargetChange}
            />
            
            <section className="mt-12">
              <div className="flex flex-col items-center mb-6">
                <h3 className="text-xl font-semibold text-primary mb-2">貯金をする（1つの丸 = 10,000円、合計1000個のドット）</h3>
                <div className="text-sm text-gray-500 italic mb-4 text-center">
                  <p>行番号ボタンをクリックすると、一行まとめてON/OFFできます！</p>
                  <p className="mt-1">ドットの変更後、「登録」ボタンを押すと貯金額に反映されます</p>
                  <p className="mt-1">10万円単位（10個のドット）が貯まると、大きな円に変わります</p>
                  <p className="mt-1">1行に50個のドットを表示（500,000円/行）</p>
                </div>
                <div className="flex items-center justify-center gap-4 my-2">
                  <div className="flex gap-0.5">
                    {Array(10).fill(0).map((_, i) => (
                      <div key={i} className="w-2 h-2 rounded-full bg-secondary"></div>
                    ))}
                  </div>
                  <div className="text-gray-500">=</div>
                  <div className="w-6 h-6 rounded-full bg-green-500 border border-green-600"></div>
                  <div className="text-sm text-gray-600">（10万円）</div>
                </div>
              </div>
              
              <SavingsDots onSavingsUpdate={handleSavingsUpdate} currentAmount={currentAmount} />
              
              {/* リセットボタンを右下に配置 */}
              <div className="flex justify-end mt-8">
                <button 
                  className="bg-danger hover:bg-red-700 text-white px-4 py-2 rounded transition transform hover:-translate-y-0.5 active:translate-y-0"
                  onClick={handleReset}
                  title="すべての貯金データをリセットします"
                >
                  リセット
                </button>
              </div>
            </section>
          </>
        ) : (
          <Auth onLogin={handleLogin} />
        )}
      </main>
      
      <footer className="bg-green-50 py-4 border-t border-gray-200 mt-auto">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>© {new Date().getFullYear()} 元本積立アプリ</p>
        </div>
      </footer>
    </div>
  );
}

export default App
