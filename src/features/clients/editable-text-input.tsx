type EditableTextInputProps = {
    value: string;
    type?: "text" | "number" | "date";
    onChange: (value: string) => void;
    onSave: () => void;
    onCancel: () => void;
  };
  
  const EditableTextInput = ({
    value,
    type = "text",
    onChange,
    onSave,
    onCancel
  }: EditableTextInputProps) => {
    return (
      <div className="flex items-center gap-2">
        <input
          type={type}
          autoFocus
          value={value ?? ""}
          onChange={(event) => onChange(event.target.value)}
          onBlur={onSave}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              event.preventDefault();
              onCancel();
            }
            if (event.key === "Enter") {
              event.preventDefault();
              onSave();
            }
          }}
          className="w-full rounded-md border border-brand/40 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40"
        />
      </div>
    );
  }

  export default EditableTextInput;