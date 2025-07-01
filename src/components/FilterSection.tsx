import React from 'react';
import SearchBar from 'components/SearchBar';
import { MultiSelectTagDropdown } from '@/components/ui/multi-select-tag-dropdown';
import { Tag } from '@/types/RecipeTypes';

interface FilterSectionProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  allTags: Tag[];
  selectedTags: Tag[];
  onTagSelect: (tag: Tag) => void;
  loading?: boolean;
  error?: string | null;
}

const FilterSection: React.FC<FilterSectionProps> = ({
  searchQuery,
  onSearchChange,
  allTags,
  selectedTags,
  onTagSelect,
  loading = false,
  error
}) => {
  return (
    <div className="mb-6 space-y-4">
      {/* Search and Tags Container */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Recipe Search Bar */}
        <div className="flex-1">
          <SearchBar
            searchQuery={searchQuery}
            onSearchChange={onSearchChange}
          />
        </div>
        
        {/* Tag Dropdown */}
        <div className="md:w-64">
          <MultiSelectTagDropdown
            allTags={allTags}
            selectedTags={selectedTags}
            onTagSelect={onTagSelect}
            loading={loading}
            error={error}
            placeholder="Filtrer par tags..."
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
};

export default FilterSection;