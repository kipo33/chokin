import { createClient } from '@supabase/supabase-js';

// 環境変数から取得するのが理想的です
// .env.local ファイルにVITE_SUPABASE_URLとVITE_SUPABASE_ANON_KEYを設定してください
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// 環境変数が設定されているか確認
const hasValidConfig = Boolean(supabaseUrl && supabaseAnonKey);

// 環境変数が設定されていない場合は警告を表示
if (!hasValidConfig) {
  console.error('Supabase環境変数が設定されていません！');
  console.error('VITE_SUPABASE_URLとVITE_SUPABASE_ANON_KEYを.envファイルに設定してください');
}

// セッション関連の問題解決ヘルパー関数
const clearStoredSession = () => {
  console.log('💡 保存されたセッションをクリアします');
  try {
    // localStorage内のsupabase関連のデータをクリア
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('sb-') || key.includes('supabase')) {
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.error('セッションクリア中にエラー:', error);
  }
};

// モックSupabaseクライアント
// 環境変数がない場合にエラーを防ぐためのダミークライアント
const createMockClient = () => {
  console.log('💡 モックSupabaseクライアントを作成します');
  
  return {
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
      signOut: async () => {
        clearStoredSession();
        return { error: null };
      },
      signInWithOAuth: async () => ({ error: null }),
      onAuthStateChange: () => ({ 
        data: { subscription: { unsubscribe: () => {} } },
        error: null 
      })
    },
    from: () => ({
      select: () => ({ data: null, error: null }),
      insert: () => ({ data: null, error: null }),
      update: () => ({ data: null, error: null }),
      delete: () => ({ data: null, error: null }),
      eq: () => ({ data: null, error: null })
    })
  };
};

// シングルトンパターンでSupabaseクライアントを作成
// これにより複数のGoTrueClientインスタンスが作成されるのを防ぐ
let supabaseInstance;

export const supabase = (() => {
  if (!supabaseInstance) {
    if (hasValidConfig) {
      // 環境変数が設定されている場合は正常にクライアントを作成
      console.log('💡 実際のSupabaseクライアントを作成します');
      supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
          // セッションの有効期限を長く設定
          storageKey: 'supabase-auth-token',
          flowType: 'pkce'  // より安全な認証フロー
        }
      });
    } else {
      // 環境変数が設定されていない場合はモッククライアントを返す
      supabaseInstance = createMockClient();
    }
  }
  return supabaseInstance;
})();

// セッショントラブルシューティング用のユーティリティ関数をエクスポート
export const clearSupabaseTokens = clearStoredSession; 