import React, { useState, useEffect } from 'react';
import { CirclePlus } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Combobox } from "@/components/ui/combobox";
import { Tag } from '@/types/types';
import { useGetTags } from '@/hooks/useGetTags';
import { useRecipeHandler } from '@/hooks/useRecipeHandler';

interface TagHandlerProps {
  selectedTags: Tag[];
  setSelectedTags: React.Dispatch<React.SetStateAction<Tag[]>>;
  newTags?: string[];
  setNewTags?: React.Dispatch<React.SetStateAction<string[]>>;
}

const TagHandler: React.FC<TagHandlerProps> = ({ selectedTags, setSelectedTags, newTags, setNewTags }) => {
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [newTag, setNewTag] = useState('');
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const { getTags } = useGetTags();
  const { updateTag } = useRecipeHandler();

  useEffect(() => {
    const fetchTags = async () => {
      const fetchedTags = await getTags();
      setAllTags(fetchedTags);
    };
    fetchTags();
  }, [getTags]);

  const handleNewTagAdd = () => {
    if (newTag && !newTags?.includes(newTag) && !selectedTags.some(t => t.name.toLowerCase() === newTag.toLowerCase())) {
      if (setNewTags) {
        setNewTags(prev => [...prev, newTag]);
      } else {
        setSelectedTags(prev => [...prev, { name: newTag } as Tag]);
      }
      setNewTag('');
    }
  };

  const handleUpdateTag = async () => {
    if (editingTag && newTag) {
      await updateTag(editingTag.id!.toString(), newTag);
      setAllTags(prev => prev.map(tag => (tag.id === editingTag.id ? { ...tag, name: newTag } : tag)));
      setEditingTag(null);
      setNewTag('');
    }
  };

  const startEditingTag = (tag: Tag) => {
    setEditingTag(tag);
    setNewTag(tag.name);
  };

  const handleRemoveTag = (tagToRemove: Tag) => {
    setSelectedTags(prev => {
      const updatedTags = prev.filter(tag => tag.name !== tagToRemove.name);
      return updatedTags;
    });
  };

  return (
    <div>
      <h2 className="text-lg font-bold mb-2">Ajouter un nouveau tag</h2>
      <div className="flex gap-2 mb-4">
        <Input
          type="text"
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          placeholder={editingTag ? "Modifier le tag" : "Ajouter un nouveau tag"}
        />
        <Button type="button" onClick={editingTag ? handleUpdateTag : handleNewTagAdd}>
          <CirclePlus className="mr-2" /> {editingTag ? "Modifier le tag" : "Ajouter un tag"}
        </Button>
      </div>

      <h2 className="text-lg font-bold mb-2">Liste des tags</h2>
      <Combobox
          items={allTags.map(tag => ({ label: tag.name, value: tag.name }))}
          onSelect={(value: string) => {
            const selectedTag = allTags.find(tag => tag.name === value);
            if (selectedTag && !selectedTags.includes(selectedTag)) {
              setSelectedTags([...selectedTags, selectedTag]);
            }
          }}
          placeholder="Rechercher des tags..."
          renderItem={(item: { label: string; value: string }) => (
            <div className="flex items-center justify-between">
              <span className="flex-1">{item.label}</span>
              <div className="flex items-center gap-1">
                <Button onClick={() => startEditingTag(allTags.find(tag => tag.name === item.label) as Tag)} className="ml-2">Modifier</Button>
              </div>
            </div>
          )}
      />

    <div className="mt-2 flex flex-wrap gap-2">
          {selectedTags.map(tag => (
              <div key={tag.name} className="flex items-center bg-blue-500 text-white rounded-full px-3 py-1">
                  <span>{tag.name}</span>
                  <button onClick={() => handleRemoveTag(tag)} className="ml-2 text-white">
                      X
                  </button>
              </div>
          ))}
      </div>
    </div>
  );
};

export default TagHandler;