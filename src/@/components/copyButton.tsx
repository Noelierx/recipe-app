import React, { useState } from 'react';
import { Button } from "@/components/ui/button";

interface CopyButtonProps {
    textToCopy: string;
    buttonText: string;
}

const CopyButton: React.FC<CopyButtonProps> = ({ textToCopy, buttonText }) => {
    const [copySuccess, setCopySuccess] = useState<string>('');

    const handleCopy = () => {
        navigator.clipboard.writeText(textToCopy).then(() => {
            setCopySuccess('Les informations ont été copiées dans le presse-papiers !');
            setTimeout(() => setCopySuccess(''), 3000);
        }).catch(err => {
            console.error('Erreur lors de la copie des informations :', err);
        });
    };

    return (
        <div>
            <Button onClick={handleCopy}>{buttonText}</Button>
            {copySuccess && <p className="text-green-500 mt-2">{copySuccess}</p>}
        </div>
    );
};

export {CopyButton};