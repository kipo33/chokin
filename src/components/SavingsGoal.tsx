import React, { useState } from 'react';

interface SavingsGoalProps {
  currentAmount: number;
  targetAmount: number;
  onTargetChange?: (newTarget: number) => void;
}

const SavingsGoal: React.FC<SavingsGoalProps> = ({ 
  currentAmount, 
  targetAmount,
  onTargetChange 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(targetAmount.toString());

  // 進捗率を計算
  const progressPercentage = (currentAmount / targetAmount) * 100;
  
  // 残り金額
  const remainingAmount = Math.max(0, targetAmount - currentAmount);

  // 編集モードの切り替え
  const handleEditClick = () => {
    setIsEditing(true);
    setEditValue(targetAmount.toString());
  };

  // 目標金額の保存
  const handleSave = () => {
    const newTarget = parseInt(editValue);
    if (!isNaN(newTarget) && newTarget > 0) {
      if (onTargetChange) {
        onTargetChange(newTarget);
      }
      setIsEditing(false);
    } else {
      alert('有効な金額を入力してください');
      setEditValue(targetAmount.toString());
    }
  };

  // キー入力ハンドラ
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setEditValue(targetAmount.toString());
    }
  };

  return (
    <section className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-primary">貯金目標</h2>
        
        {!isEditing ? (
          <div className="flex items-center">
            <span className="text-xl font-semibold mr-2">
              {targetAmount.toLocaleString()}円
            </span>
            <button
              className="text-blue-500 hover:text-blue-700"
              onClick={handleEditClick}
              title="目標金額を編集"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
            </button>
          </div>
        ) : (
          <div className="flex items-center">
            <input
              type="number"
              className="border rounded px-2 py-1 w-32 mr-2"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
            />
            <button
              className="bg-primary text-white px-2 py-1 rounded hover:bg-green-700"
              onClick={handleSave}
            >
              保存
            </button>
          </div>
        )}
      </div>
      
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>現在: {currentAmount.toLocaleString()}円</span>
          <span>{progressPercentage.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className="bg-primary h-2.5 rounded-full" 
            style={{ width: `${Math.min(100, progressPercentage)}%` }}
          ></div>
        </div>
      </div>
      
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm text-gray-600">残り</p>
          <p className="text-xl font-bold text-primary">{remainingAmount.toLocaleString()}円</p>
        </div>
        
        {/* 目標達成した場合 */}
        {currentAmount >= targetAmount && (
          <div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg font-semibold animate-pulse">
            🎉 目標達成おめでとうございます！
          </div>
        )}
      </div>
    </section>
  );
};

export default SavingsGoal; 