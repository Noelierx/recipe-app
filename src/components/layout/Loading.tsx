import React from 'react';
import { Card } from "@/components/ui/card";
interface LoadingProps {
  message?: string;
}

const Loading: React.FC<LoadingProps> = ({ message = "Chargement..." }) => {
  return (
    <Card className="flex items-center justify-center p-4">
      <span>{message}</span>
    </Card>
  );
};

export default Loading;