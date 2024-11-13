import React from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

interface RecipeInstructionsEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

const RecipeInstructionsEditor: React.FC<RecipeInstructionsEditorProps> = ({ value, onChange, placeholder }) => {
    return (
        <div>
            <ReactQuill
                value={value}
                onChange={onChange}
                placeholder={placeholder}
            />
        </div>
    );
};

export default RecipeInstructionsEditor;
