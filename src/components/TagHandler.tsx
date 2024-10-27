import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tag } from "@/types/types";
import { useGetTags } from "@/hooks/useGetTags";

interface TagHandlerProps {
  selectedTags: Tag[];
  setSelectedTags: React.Dispatch<React.SetStateAction<Tag[]>>;
  newTags?: string[];
  setNewTags?: React.Dispatch<React.SetStateAction<string[]>>;
}

const TagHandler: React.FC<TagHandlerProps> = ({
  selectedTags,
  setSelectedTags,
  newTags,
  setNewTags,
}) => {
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [newTag, setNewTag] = useState("");
  const { getTags } = useGetTags();

  useEffect(() => {
    const fetchTags = async () => {
      const fetchedTags = await getTags();
      setAllTags(fetchedTags);
    };
    fetchTags();
  }, [getTags]);

  const handleTagSelect = (tag: Tag) => {
    setSelectedTags((prev) =>
      prev.some((t) => t.id === tag.id)
        ? prev.filter((t) => t.id !== tag.id)
        : [...prev, tag],
    );
  };

  const handleNewTagAdd = () => {
    if (
      newTag &&
      !newTags?.includes(newTag) &&
      !selectedTags.some((t) => t.name.toLowerCase() === newTag.toLowerCase())
    ) {
      if (setNewTags) {
        setNewTags((prev) => [...prev, newTag]);
      } else {
        setSelectedTags((prev) => [...prev, { name: newTag } as Tag]);
      }
      setNewTag("");
    }
  };

  const removeNewTag = (tagToRemove: string) => {
    if (setNewTags) {
      setNewTags((prev) => prev.filter((tag) => tag !== tagToRemove));
    } else {
      setSelectedTags((prev) => prev.filter((tag) => tag.name !== tagToRemove));
    }
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-2">
        {allTags.map((tag) => (
          <Button
            key={tag.id}
            type="button"
            onClick={() => handleTagSelect(tag)}
            variant={
              selectedTags.some((t) => t.id === tag.id)
                ? "secondary"
                : "outline"
            }
          >
            {tag.name}
          </Button>
        ))}
        {newTags?.map((tag, index) => (
          <Button
            key={`new-${index}`}
            type="button"
            onClick={() => removeNewTag(tag)}
            variant="secondary"
          >
            {tag} (New)
          </Button>
        ))}
      </div>
      <div className="flex gap-2">
        <Input
          type="text"
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          placeholder="New tag"
        />
        <Button type="button" onClick={handleNewTagAdd}>
          Add Tag
        </Button>
      </div>
    </div>
  );
};

export default TagHandler;
