import { CLIENT_TYPES, formatCurrencyDOP, formatDate } from "@/lib/utils";
import EditableSelect from "./editable-select";
import EditableTextInput from "./editable-text-input";
import type { EditableField } from "./clients-table";
import { Client } from "@/db";

type ClientRowProps = {
  client: Client;
  isEditing: (field: EditableField) => boolean;
  beginEdit: (id: string, field: EditableField) => void;
  cancelEdit: () => void;
  saveEdit: (id: string, field: EditableField) => void;
  draftValue: string;
  setDraftValue: (value: string) => void;
  onDeleteClient: () => void;
}
const ClientRow = ({ client, isEditing, beginEdit, cancelEdit, saveEdit, draftValue, setDraftValue, onDeleteClient }: ClientRowProps) => {
  return (
    <tr key={client.id} className="hover:bg-slate-50/60">
      <td
        className="px-4 py-3"
        onClick={() => beginEdit(client.id, "name")}
      >
        {isEditing("name") ? (
          <EditableTextInput
            value={draftValue}
            onChange={setDraftValue}
            onSave={() => saveEdit(client.id, "name")}
            onCancel={cancelEdit}
          />
        ) : (
          <span className="cursor-text">{client.name}</span>
        )}
      </td>
      <td
        className="px-4 py-3"
        onClick={() => beginEdit(client.id, "type")}
      >
        {isEditing("type") ? (
          <EditableSelect
            value={draftValue}
            options={CLIENT_TYPES}
            onChange={setDraftValue}
            onSave={() => saveEdit(client.id, "type")}
            onCancel={cancelEdit}
          />
        ) : (
          CLIENT_TYPES.find((type) => type.value === client.type)?.label ?? client.type
        )}
      </td>
      <td
        className="px-4 py-3"
        onClick={() => beginEdit(client.id, "value")}
      >
        {isEditing("value") ? (
          <EditableTextInput
            type="number"
            value={draftValue}
            onChange={setDraftValue}
            onSave={() => saveEdit(client.id, "value")}
            onCancel={cancelEdit}
          />
        ) : (
          formatCurrencyDOP(Number(client.value ?? 0))
        )}
      </td>
      <td
        className="px-4 py-3"
        onClick={() => beginEdit(client.id, "startDate")}
      >
        {isEditing("startDate") ? (
          <EditableTextInput
            type="date"
            value={draftValue}
            onChange={setDraftValue}
            onSave={() => saveEdit(client.id, "startDate")}
            onCancel={cancelEdit}
          />
        ) : (
          formatDate(client.startDate)
        )}
      </td>
      <td
        className="px-4 py-3"
        onClick={() => beginEdit(client.id, "endDate")}
      >
        {isEditing("endDate") ? (
          <EditableTextInput
            type="date"
            value={draftValue}
            onChange={setDraftValue}
            onSave={() => saveEdit(client.id, "endDate")}
            onCancel={cancelEdit}
          />
        ) : (
          formatDate(client.endDate)
        )}
      </td>
      <td className="px-4 py-3 text-right">
        <button
          onClick={onDeleteClient}
          className="rounded-md border border-transparent px-3 py-1 text-xs font-semibold text-red-600 hover:border-red-100 hover:bg-red-50"
        >
          Delete
        </button>
      </td>
    </tr>
  )
}

export default ClientRow;