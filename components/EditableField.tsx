import React, { useState } from 'react';

interface EditableFieldProps {
  initialValue: string;
  onSave: (newValue: string) => void;
  label?: string;
  type?: 'input' | 'textarea';
}

export const EditableField: React.FC<EditableFieldProps> = ({ initialValue, onSave, label, type = 'input' }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(initialValue);

  const handleSave = () => {
    onSave(value);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setValue(initialValue);
    setIsEditing(false);
  }

  return (
    <div className="my-2">
      {label && <label className="font-semibold block mb-1">{label}</label>}
      {isEditing ? (
        <div className="flex items-center gap-2">
            {type === 'input' ? (
                <input
                    type="text"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    className="border p-2 rounded-md w-full"
                />
            ) : (
                 <textarea
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    className="border p-2 rounded-md w-full"
                    rows={4}
                />
            )}
            <button onClick={handleSave} className="bg-green-500 text-white p-2 rounded-md">Save</button>
            <button onClick={handleCancel} className="bg-gray-500 text-white p-2 rounded-md">Cancel</button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
            <p className="p-2 bg-gray-50 rounded-md flex-grow">{value}</p>
            <button onClick={() => setIsEditing(true)} className="text-blue-500 font-semibold">Edit</button>
        </div>
      )}
    </div>
  );
};
