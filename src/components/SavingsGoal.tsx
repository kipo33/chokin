import React from 'react';

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
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-primary mb-4 text-center">貯金目標: {targetAmount.toLocaleString()}円</h2>
      
      <div className="w-full bg-gray-200 rounded-full h-6 mb-6 overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-green-400 to-secondary flex items-center justify-center text-white font-medium text-sm transition-all duration-500"
          style={{ width: `${progressPercentage}%` }}
        >
          {progressPercentage > 5 && <span>{progressPercentage}%</span>}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="text-sm text-gray-500 mb-1">現在の貯金額:</div>
          <div className="text-xl font-bold text-primary">{currentAmount.toLocaleString()}円</div>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-sm text-gray-500 mb-1">残り金額:</div>
          <div className="text-xl font-bold text-gray-700">{remainingAmount > 0 ? remainingAmount.toLocaleString() : 0}円</div>
        </div>
      </div>
    </div>
  );
};

export default SavingsGoal; 