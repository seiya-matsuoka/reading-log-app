import Button from '../common/Button.jsx';
import Input from '../common/Input.jsx';

export default function QuickUpdateForm() {
  return (
    <form className="flex items-end gap-2">
      <Input type="number" placeholder="累計ページ" className="w-28" />
      <Input type="number" placeholder="分（任意）" className="w-24" />
      <Input placeholder="短いメモ（任意）" className="min-w-64" />
      <Button type="button">保存</Button>
    </form>
  );
}
