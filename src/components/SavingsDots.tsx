import { useState, useEffect } from 'react';

interface SavingsDotsProps {
  onSavingsUpdate: (amount: number) => void;
  currentAmount: number; // 現在の貯金額を受け取るプロパティを追加
}

const SavingsDots: React.FC<SavingsDotsProps> = ({ onSavingsUpdate, currentAmount }) => {
  // 保存済みのドット状態
  const [savedDots, setSavedDots] = useState<boolean[]>(Array(1000).fill(false));
  // 現在編集中のドット状態
  const [clickedDots, setClickedDots] = useState<boolean[]>(Array(1000).fill(false));
  // 変更があるかどうかのフラグ
  const [hasChanges, setHasChanges] = useState(false);
  
  // 初期化時と貯金額変更時にボタンの状態を更新
  useEffect(() => {
    // ローカルストレージからボタン状態を復元
    const storedDots = localStorage.getItem('savings-dots');
    if (storedDots) {
      const dots = JSON.parse(storedDots);
      setSavedDots(dots);
      setClickedDots(dots);
    } else if (currentAmount > 0) {
      // 保存されたボタン状態がない場合は、貯金額に基づいて自動的にボタンを設定
      const dotsCount = Math.floor(currentAmount / 10000);
      const newDots = Array(1000).fill(false);
      for (let i = 0; i < dotsCount && i < 1000; i++) {
        newDots[i] = true;
      }
      setSavedDots(newDots);
      setClickedDots(newDots);
      localStorage.setItem('savings-dots', JSON.stringify(newDots));
    }
  }, [currentAmount]);
  
  // 変更を保存して反映する処理
  const handleSaveChanges = () => {
    if (!hasChanges) return;
    
    // 変更前と変更後のONのドット数を比較して、差分を計算
    const prevActiveCount = savedDots.filter(dot => dot).length;
    const newActiveCount = clickedDots.filter(dot => dot).length;
    const difference = newActiveCount - prevActiveCount;
    
    // 状態を更新
    setSavedDots([...clickedDots]);
    localStorage.setItem('savings-dots', JSON.stringify(clickedDots));
    
    // 親コンポーネントに貯金の更新を通知（差分 × 10,000円）
    onSavingsUpdate(difference * 10000);
    
    // 変更フラグをリセット
    setHasChanges(false);
  };
  
  // ボタンがクリックされたときの処理（一時的な状態の更新のみ）
  const handleDotClick = (index: number) => {
    const newClickedDots = [...clickedDots];
    newClickedDots[index] = !newClickedDots[index];
    setClickedDots(newClickedDots);
    setHasChanges(true);
  };

  // 行全体のON/OFFを切り替える処理（一時的な状態の更新のみ）
  const handleRowToggle = (rowIndex: number) => {
    const rowStartIdx = rowIndex * 40; // 1行は40個のドット
    const rowEndIdx = Math.min(rowStartIdx + 40, 1000); // 行の末尾（1000を超えないように）
    
    // 行の現在の状態をチェック（半分以上がONなら全部OFFに、そうでなければ全部ONに）
    const rowDots = clickedDots.slice(rowStartIdx, rowEndIdx);
    const activeCount = rowDots.filter(dot => dot).length;
    const shouldActivate = activeCount <= 20; // 半分以上がONなら全部OFFに
    
    // 新しいドット状態を作成
    const newClickedDots = [...clickedDots];
    
    for (let i = rowStartIdx; i < rowEndIdx; i++) {
      newClickedDots[i] = shouldActivate;
    }
    
    // 状態を更新（一時的な更新のみ）
    setClickedDots(newClickedDots);
    setHasChanges(true);
  };

  // 変更をキャンセルする処理
  const handleCancelChanges = () => {
    if (!hasChanges) return;
    
    // 保存済みの状態に戻す
    setClickedDots([...savedDots]);
    setHasChanges(false);
  };

  // 行数を計算（1000個のドットを40個ずつで分割）
  const rowCount = Math.ceil(1000 / 40);
  const rows = Array.from({ length: rowCount }, (_, i) => i);

  return (
    <div className="max-w-3xl mx-auto">
      {/* 操作ボタン */}
      <div className="flex justify-end mb-4 gap-2">
        {hasChanges && (
          <>
            <button
              onClick={handleCancelChanges}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md transition-colors"
              title="変更をキャンセルします"
            >
              キャンセル
            </button>
            <button
              onClick={handleSaveChanges}
              className="px-4 py-2 bg-primary hover:bg-green-700 text-white rounded-md transition-colors"
              title="変更を登録して貯金額に反映します"
            >
              登録
            </button>
          </>
        )}
      </div>
      
      {/* ドット表示エリア */}
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
      
      {/* 変更がある場合の下部の登録ボタン（スマホ用） */}
      {hasChanges && (
        <div className="mt-6 flex justify-center md:hidden">
          <button
            onClick={handleSaveChanges}
            className="px-8 py-3 bg-primary hover:bg-green-700 text-white text-lg rounded-md transition-colors w-full max-w-xs"
          >
            変更を登録する
          </button>
        </div>
      )}
    </div>
  );
};

export default SavingsDots; 