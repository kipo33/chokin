import { useState, useEffect } from 'react'
import SavingsGoal from './components/SavingsGoal'
import SavingsDots from './components/SavingsDots'
import Auth from './components/Auth'
import { supabase, clearSupabaseTokens } from './supabase'
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
  const [loadError, setLoadError] = useState<string | null>(null);
  
  // デフォルトの目標金額: 1000万円
  const [targetAmount, setTargetAmount] = useState<number>(10000000);
  
  // 現在の貯金額
  const [currentAmount, setCurrentAmount] = useState<number>(0);
  
  // ログアウトが必要かどうか（セッションエラー時）
  const [needsRelogin, setNeedsRelogin] = useState(false);

  // 接続エラーフラグ - ローカルモードを強制するフラグ
  const [forceLocalMode, setForceLocalMode] = useState(false);

  // Supabase接続の確認（開発用）
  useEffect(() => {
    console.log('=== Supabase設定確認 ===');
    const hasUrl = Boolean(import.meta.env.VITE_SUPABASE_URL);
    const hasKey = Boolean(import.meta.env.VITE_SUPABASE_ANON_KEY);
    
    console.log('Supabase URL:', hasUrl ? '設定済み' : '未設定 ⚠️');
    console.log('Supabase Key:', hasKey ? '設定済み' : '未設定 ⚠️');
    
    if (!hasUrl || !hasKey) {
      console.error('環境変数が設定されていません。.envファイルを確認してください。');
      console.error('VITE_SUPABASE_URL=あなたのSupabaseプロジェクトURL');
      console.error('VITE_SUPABASE_ANON_KEY=あなたのSupabase匿名キー');
      
      // 環境変数が設定されていない場合はエラーを表示して、ローカルモードで動作するよう設定
      setLoadError('Supabaseの接続設定が見つかりません。ローカルモードで動作します。');
      setForceLocalMode(true);
      setIsLoading(false); // ローディング状態を解除
    }
  }, []);

  // 現在のセッションをチェック
  useEffect(() => {
    // 強制ローカルモードの場合はセッションチェックをスキップ
    if (forceLocalMode) {
      console.log('強制ローカルモード: セッションチェックをスキップ');
      setIsLoading(false);
      return;
    }

    const checkSession = async () => {
      console.log('💡 checkSession開始');
      setIsLoading(true);
      setLoadError(null);
      
      try {
        console.log('💡 セッションの確認を開始...');
        
        // タイムアウト処理を追加
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => {
            console.log('💡 セッション取得タイムアウト');
            reject(new Error('セッション取得がタイムアウトしました'));
          }, 10000);
        });
        
        // 直接getSessionを使用
        console.log('💡 supabase.auth.getSessionを呼び出し');
        const sessionPromise = supabase.auth.getSession();
        
        // Promise.raceでタイムアウトを実装
        console.log('💡 Promise.raceを実行');
        const { data, error } = await Promise.race([
          sessionPromise,
          timeoutPromise.then(() => {
            console.log('💡 タイムアウトのPromiseが完了');
            return { data: null, error: new Error('セッション取得がタイムアウトしました') };
          })
        ]) as { data: any, error: any };
        
        console.log('💡 Promise.race完了:', data ? '取得成功' : '取得失敗');
        
        if (error) {
          console.log('💡 エラー発生:', error.message);
          
          // セッションエラー時には保存されたトークンをクリア
          console.log('💡 セッショントークンをクリア');
          clearSupabaseTokens();
          
          // ローカルストレージのデータをリセット
          console.log('💡 ローカルストレージのデータをリセット');
          localStorage.removeItem('savings-amount');
          localStorage.removeItem('savings-dots');
          
          // 再ログインが必要なことを表示
          setNeedsRelogin(true);
          throw error;
        }
        
        if (data?.session?.user) {
          console.log('💡 セッション取得成功:', data.session.user.id);
          setUserId(data.session.user.id);
          console.log('💡 loadUserDataを呼び出し');
          try {
            await loadUserData(data.session.user.id);
            console.log('💡 loadUserData完了');
          } catch (userDataError) {
            console.error('💡 ユーザーデータ読み込みエラー:', userDataError);
            // ユーザーデータの読み込みに失敗した場合でもローカルデータを使用
            const savedAmount = localStorage.getItem('savings-amount');
            if (savedAmount) {
              setCurrentAmount(parseInt(savedAmount));
              console.log('💡 ユーザーデータ読み込み失敗後、ローカルストレージから金額を読み込み:', savedAmount);
            }
          }
        } else {
          console.log('💡 アクティブなセッションなし、ローカルデータを使用');
          // 未ログインの場合はローカルストレージから読み込む（互換性維持）
          const savedAmount = localStorage.getItem('savings-amount');
          if (savedAmount) {
            setCurrentAmount(parseInt(savedAmount));
            console.log('💡 ローカルストレージから金額を読み込み:', savedAmount);
          }
        }
        console.log('💡 try句の最後まで実行');
      } catch (error) {
        console.error('💡 セッション読み込みエラー:', error);
        
        // セッションエラー時にはローカルストレージをクリア
        console.log('💡 セッションエラー: ローカルストレージをクリア');
        localStorage.removeItem('savings-amount');
        localStorage.removeItem('savings-dots');
        
        // Supabase接続エラーの場合、ローカルモードに切り替え
        setForceLocalMode(true);
        
        if (error instanceof Error && (error.message.includes('タイムアウト') || error.message.includes('timeout'))) {
          setLoadError('ネットワーク接続が不安定です。ローカルモードで動作します。');
        } else {
          setLoadError('Supabase接続エラー: ローカルモードで動作します。');
        }
        
        // エラー状態を反映
        setCurrentAmount(0);
        setTargetAmount(10000000); // デフォルト値にリセット
      } finally {
        console.log('💡 finally句に到達 - ローディング状態を解除します');
        // 確実にローディング状態を解除
        setIsLoading(false);
        console.log('💡 ローディング状態:', false);
      }
    };
    
    console.log('💡 checkSessionを呼び出し');
    checkSession();
    
    // 認証状態の変更を監視
    console.log('💡 認証状態変更リスナーを設定');
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('💡 認証状態変更:', event, session?.user?.id || 'ユーザーなし');
        
        if (event === 'SIGNED_IN' && session?.user) {
          console.log('💡 ユーザーログイン:', session.user.id);
          setUserId(session.user.id);
          setNeedsRelogin(false); // 再ログインが完了
          await loadUserData(session.user.id);
        } else if (event === 'SIGNED_OUT') {
          console.log('💡 ユーザーログアウト');
          setUserId(null);
          setCurrentAmount(0);
          setTargetAmount(10000000);
          // ローカルストレージのデータをクリア
          localStorage.removeItem('savings-amount');
          localStorage.removeItem('savings-dots');
        }
      }
    );
    
    return () => {
      console.log('💡 クリーンアップ: 認証リスナー解除');
      authListener.subscription.unsubscribe();
    };
  }, [forceLocalMode]);
  
  // ユーザーデータの読み込み
  const loadUserData = async (id: string) => {
    try {
      // 目標金額の取得
      console.log('目標金額の取得を開始...');
      const goal = await getUserSavingsGoal(id);
      console.log('目標金額:', goal);
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
    } catch (error) {
      console.error('ユーザーデータ読み込みエラー:', error);
      setLoadError('データの読み込みに失敗しました');
      // エラー発生時にもローカルモードに切り替える
      setForceLocalMode(true);
      throw error; // 上位のエラーハンドラでキャッチできるように再スロー
    }
  };
  
  // ログイン処理
  const handleLogin = async (id: string) => {
    console.log('ログイン処理を実行:', id);
    setUserId(id);
    setNeedsRelogin(false); // 再ログイン状態をリセット
    
    try {
      await loadUserData(id);
      console.log('ユーザーデータ読み込み完了');
    } catch (error) {
      console.error('ログイン後のデータ読み込みエラー:', error);
      alert('データの読み込みに失敗しました。ローカルモードに切り替えます。');
      setForceLocalMode(true);
    }
  };
  
  // ログアウト処理
  const handleLogout = async () => {
    try {
      console.log('ログアウト処理を開始します');
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }
      
      // 状態をリセット
      setUserId(null);
      setCurrentAmount(0);
      setTargetAmount(10000000); // デフォルトの目標金額に戻す
      setLoadError(null); // エラー状態もクリア
      setNeedsRelogin(false); // 再ログイン状態をリセット
      setForceLocalMode(false); // ローカルモードをリセット
      
      // ローカルストレージのデータをクリア
      localStorage.removeItem('savings-amount');
      localStorage.removeItem('savings-dots');
      
      // すべてのセッショントークンを確実にクリア
      clearSupabaseTokens();
      
      // ページをリロードして確実に状態をリセット
      window.location.reload();
      
      console.log('ログアウト完了');
    } catch (error) {
      console.error('ログアウトエラー:', error);
      alert('ログアウトに失敗しました。もう一度お試しください。');
    }
  };
  
  // セッションリフレッシュ処理（トークン切れ時に使用）
  const handleRefreshSession = () => {
    // すべてのトークンをクリア
    clearSupabaseTokens();
    
    // ローカルストレージのデータをリセット
    localStorage.removeItem('savings-amount');
    localStorage.removeItem('savings-dots');
    
    setForceLocalMode(false);
    // ページをリロード
    window.location.reload();
  };
  
  // 目標金額の変更処理
  const handleTargetChange = async (newTarget: number) => {
    setTargetAmount(newTarget);
    
    if (userId && !forceLocalMode) {
      try {
        await setUserSavingsGoal(userId, newTarget);
      } catch (error) {
        console.error('目標金額の保存に失敗しました:', error);
        // エラーがあってもUIには反映させる（ローカルには保存される）
      }
    }
  };
  
  // 貯金額の更新処理
  const handleSavingsUpdate = async (amount: number) => {
    const newAmount = Math.max(0, currentAmount + amount);
    setCurrentAmount(newAmount);
    
    if (userId && !forceLocalMode) {
      try {
        // Supabaseに保存
        await updateUserSavedAmount(userId, newAmount);
      } catch (error) {
        console.error('貯金額の更新に失敗しました:', error);
      }
    }
    
    // 常にローカルストレージにも保存（互換性維持）
    localStorage.setItem('savings-amount', newAmount.toString());
  };

  // リセット処理
  const handleReset = async () => {
    if (window.confirm('本当にリセットしますか？全ての貯金データが消去されます。')) {
      // 貯金額をリセット
      setCurrentAmount(0);
      
      if (userId && !forceLocalMode) {
        try {
          // Supabaseのデータをリセット
          await resetUserSavings(userId);
        } catch (error) {
          console.error('貯金データのリセットに失敗しました:', error);
        }
      }
      
      // 常にローカルストレージもクリア
      localStorage.removeItem('savings-amount');
      localStorage.removeItem('savings-dots');
    }
  };

  // ローカルモード切り替え
  const toggleLocalMode = () => {
    const newMode = !forceLocalMode;
    setForceLocalMode(newMode);
    if (newMode) {
      setUserId(null);
      // ローカルモード時はローカルストレージから読み込む
      const savedAmount = localStorage.getItem('savings-amount');
      if (savedAmount) {
        setCurrentAmount(parseInt(savedAmount));
      }
    } else {
      // オンラインモードに戻す場合はページをリロード
      window.location.reload();
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
  
  // エラーがあれば表示し、Auth画面を表示
  if ((loadError && !userId && !forceLocalMode) || needsRelogin) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <header className="bg-green-50 py-6 border-b-2 border-secondary">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-3xl font-bold text-primary mb-2">元本積立アプリ</h1>
            <p className="text-gray-600">目標達成まで一緒に頑張りましょう！</p>
          </div>
        </header>
        
        <main className="flex-1 container mx-auto px-4 py-6">
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
            <p>{needsRelogin ? 'セッションが無効になりました。再度ログインしてください。' : loadError}</p>
            <p className="mt-2">
              {loadError?.includes('ローカルモード') || forceLocalMode
                ? 'データはブラウザに保存されますが、同期されません。'
                : 'ログインして続行してください。'
              }
            </p>
            
            <div className="mt-3 flex flex-wrap gap-2">
              {/* セッションリフレッシュボタン */}
              {needsRelogin && (
                <button 
                  onClick={handleRefreshSession}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                >
                  セッションをリフレッシュ
                </button>
              )}
              
              {/* ローカルモード切り替えボタン */}
              <button
                onClick={toggleLocalMode}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
              >
                ローカルモードで続行
              </button>
            </div>
          </div>
          
          {forceLocalMode ? (
            // ローカルモードの場合、ログインなしで続行できるようにSavingsGoalコンポーネントを表示
            <>
              <SavingsGoal 
                currentAmount={currentAmount} 
                targetAmount={targetAmount} 
                onTargetChange={handleTargetChange}
              />
              
              <section className="mt-12">
                <div className="flex flex-col items-center mb-6">
                  <h3 className="text-xl font-semibold text-primary mb-2">貯金をする（1つの丸 = 10,000円）</h3>
                  <div className="text-sm text-gray-500 italic mb-4 text-center">
                    <p>行番号ボタンをクリックすると、一行まとめてON/OFFできます！</p>
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
                
                <SavingsDots onSavingsUpdate={handleSavingsUpdate} currentAmount={currentAmount} targetAmount={targetAmount} />
                
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

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="bg-green-50 py-6 border-b-2 border-secondary">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl font-bold text-primary mb-2">元本積立アプリ</h1>
          <p className="text-gray-600">目標達成まで一緒に頑張りましょう！</p>
          
          {(loadError && loadError.includes('ローカルモード')) || forceLocalMode ? (
            <div className="mt-2 bg-yellow-100 text-yellow-800 px-3 py-1 rounded inline-block">
              ローカルモードで動作中（データは同期されません）
              {forceLocalMode && (
                <button 
                  onClick={toggleLocalMode}
                  className="ml-2 text-xs bg-yellow-200 hover:bg-yellow-300 px-2 py-0.5 rounded"
                >
                  オンラインモードに切替
                </button>
              )}
            </div>
          ) : null}
          
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
        {userId || forceLocalMode ? (
          <>
            <SavingsGoal 
              currentAmount={currentAmount} 
              targetAmount={targetAmount} 
              onTargetChange={handleTargetChange}
            />
            
            <section className="mt-12">
              <div className="flex flex-col items-center mb-6">
                <h3 className="text-xl font-semibold text-primary mb-2">貯金をする（1つの丸 = 10,000円）</h3>
                <div className="text-sm text-gray-500 italic mb-4 text-center">
                  <p>行番号ボタンをクリックすると、一行まとめてON/OFFできます！</p>
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
              
              <SavingsDots onSavingsUpdate={handleSavingsUpdate} currentAmount={currentAmount} targetAmount={targetAmount} />
              
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
