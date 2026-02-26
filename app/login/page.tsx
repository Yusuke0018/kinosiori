'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        router.push('/');
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error || 'ログインに失敗しました');
      }
    } catch {
      setError('ネットワークエラー');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh flex items-center justify-center bg-[#FAFAF7] px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#1A1A2E] mb-2" style={{ fontFamily: '"M PLUS 1", sans-serif' }}>
            季のしおり
          </h1>
          <p className="text-sm text-[#6B6B80]">今日という日の景色を開く</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="パスワードを入力"
              autoFocus
              className="w-full px-4 py-3 rounded-2xl bg-white/70 backdrop-blur-lg border border-[#E0E0E0] text-[#1A1A2E] placeholder-[#9999AA] focus:outline-none focus:ring-2 focus:ring-[#F2724B]/40 focus:border-[#F2724B] transition-all"
            />
          </div>

          {error && (
            <p className="text-sm text-red-500 text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || !password}
            className="w-full py-3 rounded-2xl bg-[#F2724B] text-white font-semibold text-base disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#E0633D] active:scale-[0.98] transition-all"
          >
            {loading ? 'ログイン中...' : 'ログイン'}
          </button>
        </form>
      </div>
    </div>
  );
}
