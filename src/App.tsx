import { useState, useEffect } from 'react'
import SavingsGoal from './components/SavingsGoal'
import SavingsDots from './components/SavingsDots'

function App() {
  // 目標金額: 1000万円
  const targetAmount = 10000000;
  
  // 現在の貯金額
  const [currentAmount, setCurrentAmount] = useState<number>(0);
  
  // ローカルストレージからデータをロードする
  useEffect(() => {
    const savedAmount = localStorage.getItem('savings-amount');
    if (savedAmount) {
      setCurrentAmount(parseInt(savedAmount));
    }
  }, []);
  
  // 貯金額の更新処理
  const handleSavingsUpdate = (amount: number) => {
    const newAmount = Math.max(0, currentAmount + amount);
    setCurrentAmount(newAmount);
    
    // ローカルストレージに保存
    localStorage.setItem('savings-amount', newAmount.toString());
  };

  // リセット処理
  const handleReset = () => {
    if (window.confirm('本当にリセットしますか？全ての貯金データが消去されます。')) {
      // 貯金額をリセット
      setCurrentAmount(0);
      
      // ローカルストレージからデータを削除
      localStorage.removeItem('savings-amount');
      localStorage.removeItem('savings-dots');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="bg-green-50 py-6 border-b-2 border-secondary">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl font-bold text-primary mb-2">貯金進捗アプリ</h1>
          <p className="text-gray-600">目標達成まで一緒に頑張りましょう！</p>
        </div>
      </header>
      
      <main className="flex-1 container mx-auto px-4 py-6">
        <SavingsGoal currentAmount={currentAmount} targetAmount={targetAmount} />
        
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
            <button 
              className="bg-danger hover:bg-red-700 text-white px-4 py-2 rounded transition transform hover:-translate-y-0.5 active:translate-y-0"
              onClick={handleReset}
              title="すべての貯金データをリセットします"
            >
              リセット
            </button>
          </div>
          <SavingsDots onSavingsUpdate={handleSavingsUpdate} currentAmount={currentAmount} />
        </section>
      </main>
      
      <footer className="bg-green-50 py-4 border-t border-gray-200 mt-auto">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>© {new Date().getFullYear()} 貯金進捗アプリ</p>
        </div>
      </footer>
    </div>
  )
}

export default App
