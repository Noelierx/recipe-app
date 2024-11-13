import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface TimeInputProps {
    value: number | undefined;
    onChange: (value: number | undefined) => void;
    icon: React.ReactNode;
    label: string;
    id: string;
  }
  
  const TimeInput: React.FC<TimeInputProps> = ({ value, onChange, icon, label, id }) => (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <div className="flex items-center">
        {icon}
        <Input
          id={id}
          name={id}
          type="number"
          value={value || ''}
          onChange={(e) => {
            onChange(e.target.value ? Number(e.target.value) : 0);
          }}
        />
      </div>
    </div>
  );

export default TimeInput;