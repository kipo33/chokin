import { useState, useEffect, useMemo } from 'react';

interface SavingsDotsProps {
  onSavingsUpdate: (amount: number) => void;
  currentAmount: number; // 現在の貯金額
  targetAmount: number;  // 目標金額を追加
}

const SavingsDots: React.FC<SavingsDotsProps> = ({ onSavingsUpdate, currentAmount, targetAmount }) => {
  // 1ドットあたりの金額
  const DOT_VALUE = 10000;
  
  // 目標金額から必要なドット数を計算
  const maxDots = useMemo(() => Math.ceil(targetAmount / DOT_VALUE), [targetAmount]);
  
  // 保存済みのドット状態
  const [savedDots, setSavedDots] = useState<boolean[]>(Array(maxDots).fill(false));
  // 現在編集中のドット状態
  const [clickedDots, setClickedDots] = useState<boolean[]>(Array(maxDots).fill(false));
  // 変更があるかどうかのフラグ
  const [hasChanges, setHasChanges] = useState(false);
  
  // 一行あたりのドット数
  const DOTS_PER_ROW = 50;
  // 一グループあたりのドット数
  const DOTS_PER_GROUP = 10;
  
  // 目標金額が変更された場合、ドット配列のサイズを調整
  useEffect(() => {
    // 新しい配列サイズに合わせて既存の状態を調整
    setSavedDots(prev => {
      const newArray = Array(maxDots).fill(false);
      // 既存のデータを可能な限りコピー
      prev.forEach((val, idx) => {
        if (idx < maxDots) {
          newArray[idx] = val;
        }
      });
      return newArray;
    });
    
    setClickedDots(prev => {
      const newArray = Array(maxDots).fill(false);
      // 既存のデータを可能な限りコピー
      prev.forEach((val, idx) => {
        if (idx < maxDots) {
          newArray[idx] = val;
        }
      });
      return newArray;
    });
  }, [maxDots]);
  
  // 初期化時と貯金額変更時にボタンの状態を更新
  useEffect(() => {
    // ローカルストレージからボタン状態を復元
    const storedDots = localStorage.getItem('savings-dots');
    if (storedDots) {
      const dots = JSON.parse(storedDots);
      // 保存されたデータが現在の最大ドット数より多い場合は切り詰める
      const adjustedDots = dots.slice(0, maxDots);
      // 保存されたデータが現在の最大ドット数より少ない場合は拡張する
      while (adjustedDots.length < maxDots) {
        adjustedDots.push(false);
      }
      setSavedDots(adjustedDots);
      setClickedDots(adjustedDots);
    } else if (currentAmount > 0) {
      // 保存されたボタン状態がない場合は、貯金額に基づいて自動的にボタンを設定
      const dotsCount = Math.floor(currentAmount / DOT_VALUE);
      const newDots = Array(maxDots).fill(false);
      for (let i = 0; i < dotsCount && i < maxDots; i++) {
        newDots[i] = true;
      }
      setSavedDots(newDots);
      setClickedDots(newDots);
      localStorage.setItem('savings-dots', JSON.stringify(newDots));
    }
  }, [currentAmount, maxDots, DOT_VALUE]);
  
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
    
    // 親コンポーネントに貯金の更新を通知（差分 × ドット価値）
    onSavingsUpdate(difference * DOT_VALUE);
    
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

  // グループ（10個単位）がクリックされたときの処理
  const handleGroupClick = (groupIndex: number) => {
    // 10個のドットのグループの開始インデックス
    const startIdx = groupIndex * DOTS_PER_GROUP;
    const endIdx = Math.min(startIdx + DOTS_PER_GROUP, maxDots);
    
    // グループ内のすべてのドットがONかチェック
    const groupDots = clickedDots.slice(startIdx, endIdx);
    const allActive = groupDots.every(dot => dot);
    
    // 新しい状態を作成
    const newClickedDots = [...clickedDots];
    
    // グループ内のすべてのドットを反転
    for (let i = startIdx; i < endIdx; i++) {
      newClickedDots[i] = !allActive;
    }
    
    setClickedDots(newClickedDots);
    setHasChanges(true);
  };

  // 行全体のON/OFFを切り替える処理（一時的な状態の更新のみ）
  const handleRowToggle = (rowIndex: number) => {
    const rowStartIdx = rowIndex * DOTS_PER_ROW; // 1行は50個のドット
    const rowEndIdx = Math.min(rowStartIdx + DOTS_PER_ROW, maxDots); // 行の末尾（maxDotsを超えないように）
    
    // 行の現在の状態をチェック（半分以上がONなら全部OFFに、そうでなければ全部ONに）
    const rowDots = clickedDots.slice(rowStartIdx, rowEndIdx);
    const activeCount = rowDots.filter(dot => dot).length;
    const shouldActivate = activeCount <= DOTS_PER_ROW / 2; // 半分以上がONなら全部OFFに
    
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

  // ドットを増やす処理
  const handleAddDot = () => {
    // 現在OFFのドットを探す
    const firstInactiveIndex = clickedDots.findIndex(dot => !dot);
    if (firstInactiveIndex !== -1) {
      const newClickedDots = [...clickedDots];
      newClickedDots[firstInactiveIndex] = true;
      setClickedDots(newClickedDots);
      setHasChanges(true);
    }
  };

  // ドットを減らす処理
  const handleRemoveDot = () => {
    // 現在ONのドットを探す（後ろから探す）
    const lastActiveIndex = [...clickedDots].reverse().findIndex(dot => dot);
    if (lastActiveIndex !== -1) {
      const actualIndex = clickedDots.length - 1 - lastActiveIndex;
      const newClickedDots = [...clickedDots];
      newClickedDots[actualIndex] = false;
      setClickedDots(newClickedDots);
      setHasChanges(true);
    }
  };

  // 行数を計算（maxDots個のドットを50個ずつで分割）
  const rowCount = Math.ceil(maxDots / DOTS_PER_ROW);
  const rows = Array.from({ length: rowCount }, (_, i) => i);

  // 変更前後のドット数と金額を計算
  const savedDotsCount = savedDots.filter(dot => dot).length;
  const currentDotsCount = clickedDots.filter(dot => dot).length;
  const dotsDifference = currentDotsCount - savedDotsCount;
  const amountDifference = dotsDifference * DOT_VALUE;

  // 10個のドットをまとめてグループ化して表示する関数
  const renderDotGroup = (startIdx: number) => {
    const endIdx = Math.min(startIdx + DOTS_PER_GROUP, maxDots);
    const groupDots = clickedDots.slice(startIdx, endIdx);
    
    // 表示すべきドットがない場合は何も表示しない
    if (groupDots.length === 0) return null;
    
    // グループ内のONになっているドットの数
    const activeCount = groupDots.filter(dot => dot).length;
    const groupSize = groupDots.length; // 実際のグループサイズ（端数対応）
    
    // すべてONの場合、大きな円を表示
    if (activeCount === groupSize && groupSize === DOTS_PER_GROUP) {
      // 小さな円のサイズが2px (w-2) なので、面積が10倍になる半径は √10 ≈ 3.16 倍
      // 2px × 3.16 ≈ 6.32px ≈ 6px
      return (
        <button
          key={`group-${startIdx}`}
          className="w-6 h-6 rounded-full cursor-pointer hover:scale-125 hover:z-10 transition-all bg-green-500 border border-green-600 flex-shrink-0"
          onClick={() => handleGroupClick(Math.floor(startIdx / DOTS_PER_GROUP))}
          title={`貯金グループ（${DOT_VALUE * DOTS_PER_GROUP}円）`}
        />
      );
    }
    
    // 部分的にONの場合または全くONでない場合は、小さな円を個別に表示
    return (
      <div key={`group-${startIdx}`} className="flex flex-wrap gap-0.5 items-center">
        {groupDots.map((clicked, idx) => (
          <button
            key={idx}
            className={`w-2 h-2 rounded-full cursor-pointer hover:scale-150 hover:z-10 transition-all flex-shrink-0 ${
              clicked ? 'bg-secondary' : 'bg-gray-200'
            }`}
            onClick={() => handleDotClick(startIdx + idx)}
            title={`貯金ボタン（${DOT_VALUE}円）`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-full mx-auto">
      {/* 目標情報表示 */}
      <div className="mb-4 text-sm text-gray-600">
        <p>目標金額: {targetAmount.toLocaleString()}円（{maxDots}ドット）</p>
        <p>現在の達成率: {Math.floor((currentDotsCount / maxDots) * 100)}%</p>
      </div>

      {/* 操作ボタン */}
      <div className="flex items-center justify-between mb-4 gap-2">
        {/* +/- ボタン */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleAddDot}
            className="w-10 h-10 flex items-center justify-center bg-green-500 hover:bg-green-600 text-white text-xl font-bold rounded-md transition-colors"
            title="ドットを1つ追加します"
          >
            ＋
          </button>
          <button
            onClick={handleRemoveDot}
            className="w-10 h-10 flex items-center justify-center bg-red-500 hover:bg-red-600 text-white text-xl font-bold rounded-md transition-colors"
            title="ドットを1つ減らします"
          >
            －
          </button>
        </div>

        {/* 変更状態表示 */}
        <div className="flex items-center text-sm">
          {hasChanges && (
            <div className="bg-gray-100 px-3 py-2 rounded-md flex items-center gap-2">
              <span className="text-gray-600">
                {savedDotsCount}個 → {currentDotsCount}個
              </span>
              <span className={`font-medium ${dotsDifference > 0 ? 'text-green-600' : dotsDifference < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                ({dotsDifference > 0 ? '+' : ''}{dotsDifference}個 / {amountDifference > 0 ? '+' : ''}{amountDifference.toLocaleString()}円)
              </span>
            </div>
          )}
        </div>

        {/* キャンセル/登録ボタン */}
        <div className="flex items-center gap-2">
          {hasChanges && (
            <button
              onClick={handleCancelChanges}
              className="h-10 px-4 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md transition-colors"
              title="変更をキャンセルします"
            >
              キャンセル
            </button>
          )}
          <button
            onClick={handleSaveChanges}
            className="h-10 px-4 bg-primary hover:bg-green-700 text-white rounded-md transition-colors"
            title="変更を登録して貯金額に反映します"
            disabled={!hasChanges}
          >
            登録
          </button>
        </div>
      </div>
      
      {/* ドット表示エリア */}
      <div className="w-full overflow-x-auto">
        {rows.map((rowIndex) => (
          <div key={rowIndex} className="flex items-center mb-2 whitespace-nowrap">
            <button 
              className="w-16 h-7 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium rounded border border-gray-300 mr-2 flex-shrink-0 flex items-center justify-center transition-colors"
              onClick={() => handleRowToggle(rowIndex)}
              title="この行を一括でON/OFFします"
            >
              {rowIndex + 1}行目
            </button>
            <div className="flex items-center space-x-1">
              {/* 10個単位でグループ化して表示 */}
              {Array.from({ length: Math.ceil(Math.min((rowIndex + 1) * DOTS_PER_ROW, maxDots) - rowIndex * DOTS_PER_ROW) / DOTS_PER_GROUP }, (_, i) => 
                 rowIndex * DOTS_PER_ROW + i * DOTS_PER_GROUP
              ).map((startIdx) => (
                <div key={`group-container-${startIdx}`} className="flex-shrink-0">
                  {renderDotGroup(startIdx)}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      {/* スマホ用の操作ボタン */}
      <div className="mt-6 flex flex-col gap-3 md:hidden">
        {/* 変更状態表示（スマホ用） */}
        {hasChanges && (
          <div className="bg-gray-100 p-3 rounded-md flex flex-col items-center">
            <div className="flex items-center justify-center gap-2">
              <span className="text-gray-600">
                {savedDotsCount}個 → {currentDotsCount}個
              </span>
            </div>
            <div className="mt-1">
              <span className={`font-medium ${dotsDifference > 0 ? 'text-green-600' : dotsDifference < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                ({dotsDifference > 0 ? '+' : ''}{dotsDifference}個 / {amountDifference > 0 ? '+' : ''}{amountDifference.toLocaleString()}円)
              </span>
            </div>
          </div>
        )}
        
        {/* ボタングループ（スマホ用） */}
        <div className="w-full flex gap-2">
          <button
            onClick={handleAddDot}
            className="flex-1 h-12 bg-green-500 hover:bg-green-600 text-white text-lg rounded-md transition-colors"
          >
            ＋
          </button>
          <button
            onClick={handleSaveChanges}
            className="flex-2 h-12 px-4 bg-primary hover:bg-green-700 text-white text-lg rounded-md transition-colors"
            disabled={!hasChanges}
          >
            登録
          </button>
          <button
            onClick={handleRemoveDot}
            className="flex-1 h-12 bg-red-500 hover:bg-red-600 text-white text-lg rounded-md transition-colors"
          >
            －
          </button>
        </div>
      </div>
    </div>
  );
};

export default SavingsDots; 