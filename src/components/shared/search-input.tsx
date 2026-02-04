import { Input } from '../ui/input';

export const SearchInput = () => {
  return (
    <div className="flex-1 max-w-100 relative">
      <Input className="h-9" placeholder="Busque por um curso" />
    </div>
  );
};
