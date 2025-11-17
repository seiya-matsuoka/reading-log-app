import Input from '../common/Input.jsx';
import Select from '../common/Select.jsx';
import { MSG } from '../../utils/messages.js';

export default function SearchBar({ keyword, onKeywordChange, state, onStateChange }) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
      {/* キーワード検索 */}
      <div className="w-full flex-1">
        <label htmlFor="book-search-keyword" className="text-muted mb-1 block text-xs">
          キーワード
        </label>
        <Input
          id="book-search-keyword"
          placeholder={MSG.FE.UI.PLACEHOLDER.SEARCH}
          value={keyword}
          onChange={(e) => onKeywordChange(e.target.value)}
        />
      </div>

      {/* ステータス絞り込み */}
      <div className="w-full sm:w-40">
        <label htmlFor="book-search-state" className="text-muted mb-1 block text-xs">
          ステータス
        </label>
        <Select
          id="book-search-state"
          value={state}
          onChange={(e) => onStateChange(e.target.value)}
          className="w-full"
        >
          <option value="reading">読書中</option>
          <option value="done">読書済</option>
          <option value="all">すべて</option>
        </Select>
      </div>
    </div>
  );
}
