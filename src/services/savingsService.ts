import { supabase } from '../supabase';

// ユーザーの貯金目標を取得
export async function getUserSavingsGoal(userId: string): Promise<number | null> {
  try {
    // TypeScriptの型チェックを回避するためにanyを使用
    const result = await (supabase
      .from('savings_goals')
      .select('target_amount') as any)
      .eq('user_id', userId)
      .single();

    const { data, error } = result;

    if (error) {
      console.error('目標金額の取得エラー:', error);
      return null;
    }

    return data?.target_amount || null;
  } catch (error) {
    console.error('目標金額の取得中にエラーが発生しました:', error);
    return null;
  }
}

// ユーザーの現在の貯金額を取得
export async function getUserSavedAmount(userId: string): Promise<number | null> {
  try {
    // TypeScriptの型チェックを回避するためにanyを使用
    const result = await (supabase
      .from('savings_goals')
      .select('saved_amount') as any)
      .eq('user_id', userId)
      .single();

    const { data, error } = result;

    if (error) {
      console.error('貯金額の取得エラー:', error);
      return null;
    }

    return data?.saved_amount || null;
  } catch (error) {
    console.error('貯金額の取得中にエラーが発生しました:', error);
    return null;
  }
}

// ユーザーの貯金目標を設定
export async function setUserSavingsGoal(
  userId: string, 
  targetAmount: number
): Promise<boolean> {
  try {
    // 既存のレコードがあるか確認
    const { data: existingData } = await (supabase
      .from('savings_goals')
      .select('id') as any)
      .eq('user_id', userId)
      .single();

    if (existingData) {
      // 既存のレコードを更新
      const { error } = await (supabase
        .from('savings_goals')
        .update({ target_amount: targetAmount }) as any)
        .eq('user_id', userId);

      if (error) {
        console.error('目標金額の更新エラー:', error);
        return false;
      }
    } else {
      // 新しいレコードを作成
      const { error } = await supabase
        .from('savings_goals')
        .insert([{ user_id: userId, target_amount: targetAmount, saved_amount: 0 }]);

      if (error) {
        console.error('目標金額の作成エラー:', error);
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error('目標金額の設定中にエラーが発生しました:', error);
    return false;
  }
}

// ユーザーの現在の貯金額を更新
export async function updateUserSavedAmount(
  userId: string, 
  savedAmount: number
): Promise<boolean> {
  try {
    const { error } = await (supabase
      .from('savings_goals')
      .update({ saved_amount: savedAmount }) as any)
      .eq('user_id', userId);

    if (error) {
      console.error('貯金額の更新エラー:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('貯金額の更新中にエラーが発生しました:', error);
    return false;
  }
}

// ユーザーの貯金情報をリセット
export async function resetUserSavings(userId: string): Promise<boolean> {
  try {
    const { error } = await (supabase
      .from('savings_goals')
      .update({ saved_amount: 0 }) as any)
      .eq('user_id', userId);

    if (error) {
      console.error('貯金リセットエラー:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('貯金リセット中にエラーが発生しました:', error);
    return false;
  }
} 