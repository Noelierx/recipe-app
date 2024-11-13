import React from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import DOMPurify from 'dompurify';

interface RecipeInstructionsEditorProps {
    value: string;
    onChange: (content: string) => void;
    placeholder?: string;
    formats?: string[];
};

const RecipeInstructionsEditor: React.FC<RecipeInstructionsEditorProps> = ({ 
    value, 
    onChange, 
    placeholder,
    formats 
}) => {
    const handleChange = (content: string) => {
        onChange(DOMPurify.sanitize(content));
   };

  return (
        <div>
            <ReactQuill
                value={value}
                onChange={handleChange}
                placeholder={placeholder}
                formats={formats}
                theme="snow"
            />
        </div>
    );
};

export default RecipeInstructionsEditor;