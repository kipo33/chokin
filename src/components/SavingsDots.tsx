import { useState } from 'react';
import './SavingsDots.css';

interface SavingsDotsProps {
  onSavingsUpdate: (amount: number) => void;
}

const SavingsDots: React.FC<SavingsDotsProps> = ({ onSavingsUpdate }) => {
  // 貯金ボタンがクリックされた状態を管理する配列（1000個）
  const [clickedDots, setClickedDots] = useState<boolean[]>(Array(1000).fill(false));
  
  // ボタンがクリックされたときの処理
  const handleDotClick = (index: number) => {
    const newClickedDots = [...clickedDots];
    newClickedDots[index] = !newClickedDots[index];
    setClickedDots(newClickedDots);
    
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