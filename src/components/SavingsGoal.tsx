import React from 'react';
import './SavingsGoal.css';

interface SavingsGoalProps {
  currentAmount: number;
  targetAmount: number;
}

const SavingsGoal: React.FC<SavingsGoalProps> = ({ currentAmount, targetAmount }) => {
  // 進捗率を計算（0〜100%）
  const progressPercentage = Math.min(Math.round((currentAmount / targetAmount) * 100), 100);
  
  // 残りの金額
  const remainingAmount = targetAmount - currentAmount;
  
  return (
    <div className="savings-goal">
      <h2>貯金目標: {targetAmount.toLocaleString()}円</h2>
      <div className="progress-container">
        <div 
          className="progress-bar" 
          style={{ width: `${progressPercentage}%` }}
        >
          <span className="progress-text">{progressPercentage}%</span>
        </div>
      </div>
      
      <div className="savings-info">
        <div className="info-item">
          <span className="info-label">現在の貯金額:</span>
          <span className="info-value">{currentAmount.toLocaleString()}円</span>
        </div>
        <div className="info-item">
          <span className="info-label">残り金額:</span>
          <span className="info-value">{remainingAmount > 0 ? remainingAmount.toLocaleString() : 0}円</span>
        </div>
      </div>
    </div>
  );
};

export default SavingsGoal; 