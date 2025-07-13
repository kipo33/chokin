import { useState, useEffect } from 'react';
import './SavingsDots.css';

interface SavingsDotsProps {
  onSavingsUpdate: (amount: number) => void;
  currentAmount: number; // 現在の貯金額を受け取るプロパティを追加
}

const SavingsDots: React.FC<SavingsDotsProps> = ({ onSavingsUpdate, currentAmount }) => {
  // 貯金ボタンがクリックされた状態を管理する配列（1000個）
  const [clickedDots, setClickedDots] = useState<boolean[]>(Array(1000).fill(false));
  
  // 初期化時と貯金額変更時にボタンの状態を更新
  useEffect(() => {
    // ローカルストレージからボタン状態を復元
    const savedDots = localStorage.getItem('savings-dots');
    if (savedDots) {
      setClickedDots(JSON.parse(savedDots));
    } else if (currentAmount > 0) {
      // 保存されたボタン状態がない場合は、貯金額に基づいて自動的にボタンを設定
      const dotsCount = Math.floor(currentAmount / 10000);
      const newClickedDots = Array(1000).fill(false);
      for (let i = 0; i < dotsCount && i < 1000; i++) {
        newClickedDots[i] = true;
      }
      setClickedDots(newClickedDots);
      localStorage.setItem('savings-dots', JSON.stringify(newClickedDots));
    }
  }, [currentAmount]);
  
  // ボタンがクリックされたときの処理
  const handleDotClick = (index: number) => {
    const newClickedDots = [...clickedDots];
    newClickedDots[index] = !newClickedDots[index];
    setClickedDots(newClickedDots);
    
    // ボタン状態をローカルストレージに保存
    localStorage.setItem('savings-dots', JSON.stringify(newClickedDots));
    
    // 親コンポーネントに貯金の更新を通知
    // クリックした場合は+10,000円、クリックを解除した場合は-10,000円
    onSavingsUpdate(newClickedDots[index] ? 10000 : -10000);
  };

  return (
    <div className="savings-dots-container">
      {clickedDots.map((clicked, index) => (
        <button
          key={index}
          className={`savings-dot ${clicked ? 'clicked' : ''}`}
          onClick={() => handleDotClick(index)}
          title={`貯金ボタン（10,000円）`}
        />
      ))}
    </div>
  );
};

export default SavingsDots; 