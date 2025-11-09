import { statsService } from '../services/statsService.js';
import { http } from '../utils/http.js';
import { MSG } from '../utils/messages.js';

async function getMonthlyPages(req, res) {
  try {
    const result = await statsService.getMonthlyPages({
      userId: req.demoUser,
      year: req.query.year,
      month: req.query.month,
    });
    return http.ok(res, result);
  } catch (e) {
    const m = e?.message;
    if (m === MSG.ERR_BAD_REQUEST) return http.bad(res, m);
    return http.error(res, MSG.ERR_INTERNAL);
  }
}

export const statsController = { getMonthlyPages };
