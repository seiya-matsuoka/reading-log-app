import { MSG } from './messages.js';

function okBody(data, message) {
  return message ? { data, message } : { data };
}

function errBody(message) {
  return { error: true, message };
}

// 共通httpレスポンスヘルパ
export const http = {
  // 2xx
  ok(res, data, message) {
    return res.status(200).json(okBody(data, message));
  },
  created(res, data, message = MSG.INFO_SAVED) {
    return res.status(201).json(okBody(data, message));
  },
  noContent(res) {
    return res.status(204).end();
  },

  // 4xx
  bad(res, message = MSG.ERR_BAD_REQUEST) {
    return res.status(400).json(errBody(message));
  },
  forbidden(res, message = MSG.ERR_FORBIDDEN_READONLY) {
    return res.status(403).json(errBody(message));
  },
  notFound(res, message = MSG.ERR_NOT_FOUND) {
    return res.status(404).json(errBody(message));
  },
  conflict(res, message = MSG.ERR_CONFLICT) {
    return res.status(409).json(errBody(message));
  },

  // 5xx
  error(res, message = MSG.ERR_INTERNAL) {
    return res.status(500).json(errBody(message));
  },
};
