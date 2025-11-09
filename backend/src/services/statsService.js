import { statsRepository } from '../repositories/statsRepository.js';
import { MSG } from '../utils/messages.js';
import { jstToday, daysInMonth } from '../utils/date.js';

async function getMonthlyPages({ userId, year, month }) {
  // 本日を取得（経過日数/今月判定の基準に使用）
  const today = jstToday();

  // year / month を正規化（未指定なら今月）
  const y = Number.isInteger(Number(year)) ? Number(year) : today.getFullYear();
  const m = Number.isInteger(Number(month)) ? Number(month) : today.getMonth() + 1;

  // 範囲チェック（範囲外は 400）
  if (!(y >= 1970 && y <= 2100) || !(m >= 1 && m <= 12)) {
    throw new Error(MSG.ERR_BAD_REQUEST);
  }

  // 合計ページ数を取得（SQL：「月末時点累計 − 月初直前累計」を全book分合算）
  const { totalPages } = await statsRepository.getMonthlyPages({ userId, year: y, month: m });

  // 平均の分母を決定（過去月の場合は暦日数、今月の場合は本日の日にち）
  const isCurrentMonth = y === today.getFullYear() && m === today.getMonth() + 1;
  const denom = isCurrentMonth ? today.getDate() : daysInMonth(y, m);

  // 平均値を算出（小数第1位で四捨五入）
  const avgPerDay = denom > 0 ? Math.round((totalPages / denom) * 10) / 10 : 0;

  return { year: y, month: m, totalPages, avgPerDay, days: denom };
}

export const statsService = { getMonthlyPages };
