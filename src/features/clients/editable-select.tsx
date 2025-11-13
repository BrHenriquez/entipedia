import { useCallback } from "react";

type EditableSelectProps = {
  value: string;
  options: readonly { value: string; label: string }[];
  onChange: (value: string) => void;
  onSave: () => void;
  onCancel: () => void;
};

const EditableSelect = ({ value, options, onChange, onSave, onCancel }: EditableSelectProps) => {
  const onKeyDown = useCallback((event: React.KeyboardEvent<HTMLSelectElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      onCancel();
    }
    if (event.key === "Enter") {
      event.preventDefault();
      onSave();
    }
  }, [onCancel, onSave]);

  return (
    <select
      autoFocus
      value={value}
      onChange={(event) => onChange(event.target.value)}
      onBlur={onSave}
      onKeyDown={onKeyDown}
      className="w-full rounded-md border border-brand/40 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

export default EditableSelect;
