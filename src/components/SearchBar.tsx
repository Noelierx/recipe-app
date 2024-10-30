import React from 'react';
import { Input } from "@/components/ui/input";

interface SearchBarProps {
    searchQuery: string;
    onSearchChange: (query: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ searchQuery, onSearchChange }) => {
    return (
        <Input 
            type="text" 
            placeholder="Search recipes..." 
            value={searchQuery} 
            onChange={(e) => onSearchChange(e.target.value)} 
            className="mb-4"
        />
    );
};

export default SearchBar; 