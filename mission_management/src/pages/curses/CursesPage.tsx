import { useState } from 'react';
import { useCurses } from '../../hooks/useCurses';
import type { Curse } from '../../types/curse';
import { CURSE_GRADE, CURSE_TYPE, CURSE_STATE, CURSE_DANGER_LEVEL } from '../../types/curse';

export const CursesPage = () => {
  const { list, create, update, remove } = useCurses();
  const [form, setForm] = useState<Omit<Curse, 'id'>>({
    nombre: '',
    fechaYHoraDeAparicion: new Date().toISOString(),
    grado: CURSE_GRADE.grado_1,
    tipo: CURSE_TYPE.maligna,
    estadoActual: CURSE_STATE.activa,
    nivelPeligro: CURSE_DANGER_LEVEL.bajo,
    ubicacionDeAparicion: '',
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
    setForm({ nombre: '', fechaYHoraDeAparicion: new Date().toISOString(), grado: CURSE_GRADE.grado_1, tipo: CURSE_TYPE.maligna, estadoActual: CURSE_STATE.activa, nivelPeligro: CURSE_DANGER_LEVEL.bajo, ubicacionDeAparicion: '' });
  };

  const startEdit = (c: Curse) => {
    setEditId(c.id);
    const payload: Omit<Curse, 'id'> = {
      nombre: c.nombre,
      fechaYHoraDeAparicion: c.fechaYHoraDeAparicion,
      grado: c.grado,
      tipo: c.tipo,
      estadoActual: c.estadoActual,
      nivelPeligro: c.nivelPeligro,
      ubicacionDeAparicion: c.ubicacionDeAparicion,
    };
    setForm(payload);
  };

  if (list.isLoading) return <div className="p-4">Loading...</div>;
  if (list.isError) return <div className="p-4 text-red-400">Error loading curses</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold mb-4">Curses</h1>
      <form onSubmit={onSubmit} className="space-y-3 mb-6">
        <div className="grid grid-cols-2 gap-2">
          <input className="border px-2 py-1 text-black" placeholder="Name" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
          <input className="border px-2 py-1 text-black" placeholder="Location" value={form.ubicacionDeAparicion} onChange={(e) => setForm({ ...form, ubicacionDeAparicion: e.target.value })} />
          <select className="border px-2 py-1 text-black" value={form.grado} onChange={(e) => setForm({ ...form, grado: e.target.value as typeof form.grado })}>
            {Object.values(CURSE_GRADE).map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
          <select className="border px-2 py-1 text-black" value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value as typeof form.tipo })}>
            {Object.values(CURSE_TYPE).map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <select className="border px-2 py-1 text-black" value={form.estadoActual} onChange={(e) => setForm({ ...form, estadoActual: e.target.value as typeof form.estadoActual })}>
            {Object.values(CURSE_STATE).map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <select className="border px-2 py-1 text-black" value={form.nivelPeligro} onChange={(e) => setForm({ ...form, nivelPeligro: e.target.value as typeof form.nivelPeligro })}>
            {Object.values(CURSE_DANGER_LEVEL).map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
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
            <th className="border-b p-2">Type</th>
            <th className="border-b p-2">State</th>
            <th className="border-b p-2">Danger</th>
            <th className="border-b p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {list.data?.map((c) => (
            <tr key={c.id} className="border-b">
              <td className="p-2">{c.id}</td>
              <td className="p-2">{c.nombre}</td>
              <td className="p-2">{c.grado}</td>
              <td className="p-2">{c.tipo}</td>
              <td className="p-2">{c.estadoActual}</td>
              <td className="p-2">{c.nivelPeligro}</td>
              <td className="p-2 flex gap-2">
                <button className="px-2 py-1 bg-slate-600 text-white rounded" onClick={() => startEdit(c)}>Edit</button>
                <button className="px-2 py-1 bg-red-600 text-white rounded" onClick={() => remove.mutate(c.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
