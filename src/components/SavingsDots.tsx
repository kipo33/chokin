import { useState, useEffect } from 'react';

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

  // 行全体のON/OFFを切り替える処理
  const handleRowToggle = (rowIndex: number) => {
    const rowStartIdx = rowIndex * 40; // 1行は40個のドット
    const rowEndIdx = Math.min(rowStartIdx + 40, 1000); // 行の末尾（1000を超えないように）
    
    // 行の現在の状態をチェック（半分以上がONなら全部OFFに、そうでなければ全部ONに）
    const rowDots = clickedDots.slice(rowStartIdx, rowEndIdx);
    const activeCount = rowDots.filter(dot => dot).length;
    const shouldActivate = activeCount <= 20; // 半分以上がONなら全部OFFに
    
    // 新しいドット状態を作成
    const newClickedDots = [...clickedDots];
    let changeCount = 0;
    
    for (let i = rowStartIdx; i < rowEndIdx; i++) {
      if (newClickedDots[i] !== shouldActivate) {
        changeCount += shouldActivate ? 1 : -1;
        newClickedDots[i] = shouldActivate;
      }
    }
    
    // 状態を更新
    setClickedDots(newClickedDots);
    localStorage.setItem('savings-dots', JSON.stringify(newClickedDots));
    
    // 変更された数 × 10000円を更新
    onSavingsUpdate(changeCount * 10000);
  };

  // 行数を計算（1000個のドットを40個ずつで分割）
  const rowCount = Math.ceil(1000 / 40);
  const rows = Array.from({ length: rowCount }, (_, i) => i);

  return (
    <div className="max-w-3xl mx-auto">
      {rows.map((rowIndex) => (
        <div key={rowIndex} className="flex items-center mb-1.5">
          <button 
            className="w-16 h-7 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium rounded border border-gray-300 mr-2 flex items-center justify-center transition-colors"
            onClick={() => handleRowToggle(rowIndex)}
            title="この行を一括でON/OFFします"
          >
            {rowIndex + 1}行目
          </button>
          <div className="flex flex-wrap gap-0.5">
            {clickedDots
              .slice(rowIndex * 40, Math.min((rowIndex + 1) * 40, 1000))
              .map((clicked, idx) => (
                <button
                  key={idx}
                  className={`w-2.5 h-2.5 rounded-full cursor-pointer hover:scale-150 hover:z-10 transition-all ${
                    clicked ? 'bg-secondary' : 'bg-gray-200'
                  }`}
                  onClick={() => handleDotClick(rowIndex * 40 + idx)}
                  title={`貯金ボタン（10,000円）`}
                />
              ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default SavingsDots; 