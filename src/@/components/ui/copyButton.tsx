import React, { useState } from 'react';
import { Button } from "@/components/ui/button";

interface CopyButtonProps {
    textToCopy?: string;
    buttonText: string;
    copyType: 'text' | 'url';
}

const CopyButton: React.FC<CopyButtonProps> = ({ textToCopy, buttonText, copyType }) => {
    const [copySuccess, setCopySuccess] = useState<string>('');

    const handleCopy = () => {
        let text = '';
        if (copyType === 'text' && textToCopy) {
            text = textToCopy;
        } else if (copyType === 'url') {
            text = window.location.href;
        }

        navigator.clipboard.writeText(text).then(() => {
            setCopySuccess('Copié dans le presse-papiers !');
            setTimeout(() => setCopySuccess(''), 3000);
        }).catch(err => {
            console.error('Erreur lors de la copie :', err);
        });
    };

    return (
        <div>
            <Button onClick={handleCopy}>{buttonText}</Button>
            {copySuccess && <p className="text-green-500 mt-2">{copySuccess}</p>}
        </div>
    );
};

export default CopyButton;