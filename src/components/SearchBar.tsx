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
            placeholder="Chercher une recette" 
            value={searchQuery} 
            onChange={(e) => onSearchChange(e.target.value)} 
            className="mb-4 w-full h-11"
            aria-label="Chercher des recettes par ingrédients, tags ou titre"
            role="searchbox"
            onKeyDown={(e) => {
                if (e.key === 'Escape') {
                    onSearchChange('');
                }
            }}
        />
    );
};

export default SearchBar; 