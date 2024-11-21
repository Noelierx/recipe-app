import React from 'react';
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ErrorProps {
  message: string;
}

const ErrorMessage: React.FC<ErrorProps> = ({ message }) => {
  return (
      <Alert variant="destructive">
      <AlertDescription>
        <span>{message}</span>
        </AlertDescription>
      </Alert>
  );
};

export default ErrorMessage;