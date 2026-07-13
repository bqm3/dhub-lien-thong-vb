import { useMemo, useState } from 'react';

type UseCrudListOptions<T> = {
  filterFn?: (item: T, keyword: string) => boolean;
  generateId?: () => string;
};

export function useCrudList<T extends Record<string, unknown>>(
  initialData: T[],
  emptyForm: T,
  idField: keyof T,
  options?: UseCrudListOptions<T>
) {
  const [rows, setRows] = useState<T[]>(initialData);
  const [keyword, setKeyword] = useState('');
  const [openEditor, setOpenEditor] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<T>(emptyForm);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = keyword.trim().toLowerCase();
    if (!q) return rows;
    if (options?.filterFn) return rows.filter((item) => options.filterFn!(item, q));
    return rows.filter((item) =>
      Object.values(item).some((value) => String(value).toLowerCase().includes(q))
    );
  }, [keyword, rows, options]);

  function handleOpenCreate() {
    setEditingId(null);
    const newId = options?.generateId?.() ?? String(Date.now());
    setFormValues({
      ...emptyForm,
      [idField]: newId,
      ...(Object.prototype.hasOwnProperty.call(emptyForm, 'updatedAt')
        ? { updatedAt: new Date().toLocaleString('vi-VN') }
        : {}),
      ...(Object.prototype.hasOwnProperty.call(emptyForm, 'createdAt')
        ? { createdAt: new Date().toLocaleString('vi-VN') }
        : {}),
    } as T);
    setOpenEditor(true);
  }

  function handleEdit(item: T) {
    setEditingId(String(item[idField]));
    setFormValues(item);
    setOpenEditor(true);
  }

  function handleSubmit(validate?: (form: T) => boolean) {
    if (validate && !validate(formValues)) return;

    const payload = {
      ...formValues,
      ...(Object.prototype.hasOwnProperty.call(formValues, 'updatedAt')
        ? { updatedAt: new Date().toLocaleString('vi-VN') }
        : {}),
    } as T;

    if (editingId) {
      setRows((prev) =>
        prev.map((item) => (String(item[idField]) === editingId ? payload : item))
      );
    } else {
      setRows((prev) => [payload, ...prev]);
    }

    setOpenEditor(false);
  }

  function handleConfirmDelete() {
    if (!deletingId) return;
    setRows((prev) => prev.filter((item) => String(item[idField]) !== deletingId));
    setDeletingId(null);
  }

  return {
    rows,
    keyword,
    setKeyword,
    filtered,
    openEditor,
    setOpenEditor,
    editingId,
    formValues,
    setFormValues,
    deletingId,
    setDeletingId,
    handleOpenCreate,
    handleEdit,
    handleSubmit,
    handleConfirmDelete,
  };
}
