import { useState } from 'react';
import { useSorcerers } from '../../hooks/useSorcerers';
import type { Sorcerer } from '../../types/sorcerer';
import { SORCERER_GRADE, SORCERER_STATUS } from '../../types/sorcerer';

export const SorcerersPage = () => {
  const { list, create, update, remove } = useSorcerers();
  const [form, setForm] = useState<Omit<Sorcerer, 'id'>>({
    name: '',
    grado: SORCERER_GRADE.estudiante,
    experiencia: 0,
    estado: SORCERER_STATUS.activo,
    tecnicaPrincipal: '',
  });
  const [editId, setEditId] = useState<number | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editId) {
      await update.mutateAsync({ id: editId, patch: form });
      setEditId(null);
    } else {
      await create.mutateAsync(form);
    }
    setForm({ name: '', grado: SORCERER_GRADE.estudiante, experiencia: 0, estado: SORCERER_STATUS.activo, tecnicaPrincipal: '' });
  };

  const startEdit = (s: Sorcerer) => {
    setEditId(s.id);
    const payload: Omit<Sorcerer, 'id'> = {
      name: s.name,
      grado: s.grado,
      experiencia: s.experiencia,
      estado: s.estado,
      tecnicaPrincipal: s.tecnicaPrincipal,
    };
    setForm(payload);
  };

  if (list.isLoading) return <div className="p-4">Loading...</div>;
  if (list.isError) return <div className="p-4 text-red-400">Error loading sorcerers</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold mb-4">Sorcerers</h1>
      <form onSubmit={onSubmit} className="space-y-3 mb-6">
        <div className="grid grid-cols-2 gap-2">
          <input className="border px-2 py-1 text-black" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input className="border px-2 py-1 text-black" placeholder="Experience" type="number" value={form.experiencia} onChange={(e) => setForm({ ...form, experiencia: Number(e.target.value) })} />
          <select
            className="border px-2 py-1 text-black"
            value={form.grado}
            onChange={(e) => setForm({ ...form, grado: e.target.value as typeof form.grado })}
          >
            {Object.values(SORCERER_GRADE).map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
          <select
            className="border px-2 py-1 text-black"
            value={form.estado}
            onChange={(e) => setForm({ ...form, estado: e.target.value as typeof form.estado })}
          >
            {Object.values(SORCERER_STATUS).map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <input className="border px-2 py-1 text-black col-span-2" placeholder="Main Technique" value={form.tecnicaPrincipal ?? ''} onChange={(e) => setForm({ ...form, tecnicaPrincipal: e.target.value })} />
        </div>
        <button className="bg-indigo-600 text-white px-3 py-1 rounded" disabled={create.isPending || update.isPending}>
          {editId ? 'Update' : 'Create'}
        </button>
      </form>

      <table className="w-full text-left border-collapse">
        <thead>
          <tr>
            <th className="border-b p-2">ID</th>
            <th className="border-b p-2">Name</th>
            <th className="border-b p-2">Grade</th>
            <th className="border-b p-2">Exp</th>
            <th className="border-b p-2">Status</th>
            <th className="border-b p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {list.data?.map((s) => (
            <tr key={s.id} className="border-b">
              <td className="p-2">{s.id}</td>
              <td className="p-2">{s.name}</td>
              <td className="p-2">{s.grado}</td>
              <td className="p-2">{s.experiencia}</td>
              <td className="p-2">{s.estado}</td>
              <td className="p-2 flex gap-2">
                <button className="px-2 py-1 bg-slate-600 text-white rounded" onClick={() => startEdit(s)}>Edit</button>
                <button className="px-2 py-1 bg-red-600 text-white rounded" onClick={() => remove.mutate(s.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
