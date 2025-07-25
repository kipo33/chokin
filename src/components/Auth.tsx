import { useState } from 'react';
import { supabase } from '../supabase';

interface AuthProps {
  onLogin: (userId: string) => void;
}

const Auth = ({ onLogin }: AuthProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleAuth = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // ブラウザの保存されたセッションを先に確認
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData?.session?.user) {
        console.log('既存のセッションを使用:', sessionData.session.user.id);
        onLogin(sessionData.session.user.id);
        return;
      }
      
      // 既存セッションがなければOAuthログイン
      console.log('Googleログインを開始...');
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
          queryParams: {
            prompt: 'select_account' // 毎回アカウント選択画面を表示
          }
        }
      });

      if (error) throw error;
      
      // OAuth完了後、認証リスナーで処理されますが、
      // 念のため現在のセッションがあれば処理します
      console.log('Googleログイン完了、セッション確認中...');
      const session = await supabase.auth.getSession();
      if (session?.data?.session?.user?.id) {
        console.log('新規セッション取得成功:', session.data.session.user.id);
        onLogin(session.data.session.user.id);
      }
      
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Google認証エラーが発生しました');
      }
      console.error('認証エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md mt-10">
      <h2 className="text-2xl font-bold text-center text-primary mb-6">
        アカウントにログイン
      </h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="mt-6">
        <button
          type="button"
          onClick={handleGoogleAuth}
          className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
          disabled={loading}
        >
          <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" width="24" height="24">
            <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
              <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"/>
              <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"/>
              <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"/>
              <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"/>
            </g>
          </svg>
          {loading ? '処理中...' : 'Googleでログイン'}
        </button>
      </div>
    </div>
  );
};

export default Auth; 