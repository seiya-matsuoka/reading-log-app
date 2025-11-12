import Input from '../common/Input.jsx';
import Select from '../common/Select.jsx';

export default function SearchBar() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Input placeholder="キーワード" className="max-w-64" />
      <Select className="w-40">
        <option value="">すべて</option>
        <option value="reading">読書中</option>
        <option value="done">読書済</option>
      </Select>
    </div>
  );
}
