import { useDebouncedCallback } from '../../hooks/use-debounced-callback';

interface Props {
  onSearch: (search: string) => void;
  onStatusChange: (status: string) => void;
}

export function Filters({ onSearch, onStatusChange }: Props) {
  const debouncedOnSearch = useDebouncedCallback(onSearch, 500);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    debouncedOnSearch(e.target.value);
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onStatusChange(e.target.value);
  };

  return (
    <section className="flex gap-4 py-4 [&_*]:border [&_*]:border-gray-300 [&_*]:p-2">
      <input type="text" placeholder="Search" onChange={handleSearch} />
      <select onChange={handleStatusChange}>
        <option value="">All</option>
        <option value="active">Active</option>
        <option value="archived">Archived</option>
        <option value="draft">Draft</option>
      </select>
    </section>
  );
}