import { useEffect, useState } from 'react';
import { api } from '../../lib/api.js';
import { jstToday, formatYmd } from '../../utils/date.js';
import { MSG } from '../../utils/messages.js';

export default function StatsBar({ ym, onChangeYm }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(''); // 通信／サーバーエラー

  // cancelled がない場合の挙動例
  //   ①「2025-10 → 2025-11 → 2025-12」と素早く切り替える
  //   ②:10月のリクエストが遅く返ってきて、12月のリクエストがその前に返ってくる
  //   ③:cancelled がないと「最後に返ってきた 10 月の結果」で state が上書き
  //   ④:UI上は「表示月: 2025-12」なのに「2025-10 の統計」が見えてしまう
  // cancelled を使用した場合の挙動
  //   ①:ym.year / ym.month が変化するたびにuseEffectが実行
  //   ②:前回の useEffect の cleanup が走り cancelled = true になる
  //   ③:その後で前回リクエストが返ってきても if (cancelled) return; で state 更新をスキップ
  //   ④:最後に選択した年月の結果だけが反映されることを保証
  useEffect(() => {
    let cancelled = false; // 古いリクエストの結果でstateを上書きしないためのフラグ

    async function fetchStats(year, month) {
      setLoading(true);
      setError('');
      try {
        const data = await api.get(`/api/stats/monthly?year=${year}&month=${month}`);
        if (cancelled) return;

        if (data && typeof data.totalPages === 'number') {
          setStats(data);
        } else {
          // 想定外のレスポンス形式の場合はデータなし扱いとする
          setStats(null);
        }
      } catch (err) {
        if (cancelled) return;
        // サーバーからのmessageを優先、なければネットワークエラー用のメッセージを表示
        setError(err?.message || MSG.FE.ERR.NETWORK);
        setStats(null);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchStats(ym.year, ym.month);

    // ym変更時やアンマウント時に、この回のリクエスト結果を無効化する
    return () => {
      cancelled = true;
    };
  }, [ym.year, ym.month]);

  // type="month" の max 属性用
  const todayStr = formatYmd(jstToday()); // "YYYY-MM-DD"
  const maxMonth = todayStr.slice(0, 7); // "YYYY-MM"

  const hasStats = stats && typeof stats.totalPages === 'number';
  const hasPages = hasStats && stats.totalPages > 0;
  const isEmpty = hasStats && stats.totalPages === 0;

  // 表示文言を状態ごとに整理
  let body;
  if (loading) {
    body = <span className="text-muted">{MSG.FE.UI.LOADING.STATS}</span>;
  } else if (error) {
    body = <span className="text-destructive text-sm">{error}</span>;
  } else if (hasPages) {
    body = (
      <span className="text-sm">
        <span className="font-medium">
          {stats.year}年{stats.month}月
        </span>
        <span className="ml-2">
          合計 {stats.totalPages} ページ／1日平均 {stats.avgPerDay} ページ
        </span>
      </span>
    );
  } else if (isEmpty) {
    // 0ページ（対象月に読書ログなし）
    body = (
      <span className="text-sm">
        <span className="font-medium">
          {ym.year}年{Number(ym.month)}月
        </span>
        <span className="text-muted ml-2">{MSG.FE.UI.EMPTY.STATS}</span>
      </span>
    );
  } else {
    // 想定外のパターンは統計なしとする
    body = <span className="text-muted text-sm">{MSG.FE.UI.EMPTY.STATS}</span>;
  }

  return (
    <section className="bg-surface-1 border-border/40 mb-4 flex flex-col gap-2 rounded-(--radius) border p-3 sm:flex-row sm:items-center sm:justify-between">
      {/* 左側: 統計情報／メッセージ */}
      <div>{body}</div>

      {/* 右側: 月の選択 */}
      <div className="flex items-center gap-2 text-xs sm:text-sm">
        <label htmlFor="stats-month" className="text-muted">
          表示月
        </label>
        <input
          id="stats-month"
          type="month"
          max={maxMonth}
          value={`${ym.year}-${String(ym.month).padStart(2, '0')}`}
          onChange={(e) => {
            if (!e.target.value) return;
            const [y, m] = e.target.value.split('-');
            onChangeYm({ year: y, month: m });
          }}
          className="border-border/50 bg-surface focus:ring-primary-100 rounded-(--radius) border px-2 py-1 text-sm outline-none focus:border-transparent focus:ring-2"
        />
      </div>
    </section>
  );
}
