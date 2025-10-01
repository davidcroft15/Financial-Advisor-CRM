import React from 'react';
import { Bell, Search, User } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

interface HeaderProps {
  onSearch: (query: string) => void;
  searchQuery: string;
}

export const Header: React.FC<HeaderProps> = ({ onSearch, searchQuery }) => {
  return (
    <header className="flex h-16 items-center justify-between border-b bg-background px-6">
      <div className="flex items-center space-x-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search clients, tasks, or documents..."
            value={searchQuery}
            onChange={(e) => onSearch(e.target.value)}
            className="w-80 pl-10"
          />
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon">
          <Bell className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon">
          <User className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
};
