import { useState, useEffect } from 'react'
import './App.css'
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
    <div className="app-container">
      <header className="app-header">
        <h1>貯金進捗アプリ</h1>
        <p>目標達成まで一緒に頑張りましょう！</p>
      </header>
      
      <main>
        <SavingsGoal currentAmount={currentAmount} targetAmount={targetAmount} />
        
        <section className="savings-section">
          <div className="section-header">
            <h3>貯金をする（1つの丸 = 10,000円、合計1000個のドット）</h3>
            <button 
              className="reset-button" 
              onClick={handleReset}
              title="すべての貯金データをリセットします"
            >
              リセット
            </button>
          </div>
          <SavingsDots onSavingsUpdate={handleSavingsUpdate} currentAmount={currentAmount} />
        </section>
      </main>
      
      <footer>
        <p>© {new Date().getFullYear()} 貯金進捗アプリ</p>
      </footer>
    </div>
  )
}

export default App
