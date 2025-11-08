import { useState } from 'react';
import { useMissions } from '../../hooks/useMissions';
import type { Mission } from '../../types/mission';
import { MISSION_STATE, MISSION_URGENCY } from '../../types/mission';

export const MissionsPage = () => {
  const { list, create, update, remove } = useMissions();
  const [form, setForm] = useState<Omit<Mission, 'id'>>({
    startAt: new Date().toISOString(),
    endAt: undefined,
    locationId: 0,
    state: MISSION_STATE.pending,
    events: '',
    collateralDamage: '',
    urgency: MISSION_URGENCY.planned,
    sorcererIds: [],
    curseIds: [],
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
    setForm({ startAt: new Date().toISOString(), endAt: undefined, locationId: 0, state: MISSION_STATE.pending, events: '', collateralDamage: '', urgency: MISSION_URGENCY.planned, sorcererIds: [], curseIds: [] });
  };

  const startEdit = (m: Mission) => {
    setEditId(m.id);
    const payload: Omit<Mission, 'id'> = {
      startAt: m.startAt,
      endAt: m.endAt,
      locationId: m.locationId,
      state: m.state,
      events: m.events,
      collateralDamage: m.collateralDamage,
      urgency: m.urgency,
      sorcererIds: m.sorcererIds,
      curseIds: m.curseIds,
    };
    setForm(payload);
  };

  if (list.isLoading) return <div className="p-4">Loading...</div>;
  if (list.isError) return <div className="p-4 text-red-400">Error loading missions</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold mb-4">Missions</h1>
      <form onSubmit={onSubmit} className="space-y-3 mb-6">
        <div className="grid grid-cols-2 gap-2">
          <input className="border px-2 py-1 text-black" placeholder="Location Id" type="number" value={form.locationId} onChange={(e) => setForm({ ...form, locationId: Number(e.target.value) })} />
          <select className="border px-2 py-1 text-black" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value as typeof form.state })}>
            {Object.values(MISSION_STATE).map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <select className="border px-2 py-1 text-black" value={form.urgency} onChange={(e) => setForm({ ...form, urgency: e.target.value as typeof form.urgency })}>
            {Object.values(MISSION_URGENCY).map((u) => (
              <option key={u} value={u}>{u}</option>
            ))}
          </select>
          <input className="border px-2 py-1 text-black col-span-2" placeholder="Events" value={form.events} onChange={(e) => setForm({ ...form, events: e.target.value })} />
          <input className="border px-2 py-1 text-black col-span-2" placeholder="Collateral Damage" value={form.collateralDamage} onChange={(e) => setForm({ ...form, collateralDamage: e.target.value })} />
        </div>
        <button className="bg-indigo-600 text-white px-3 py-1 rounded" disabled={create.isPending || update.isPending}>
          {editId ? 'Update' : 'Create'}
        </button>
      </form>

      <table className="w-full text-left border-collapse">
        <thead>
          <tr>
            <th className="border-b p-2">ID</th>
            <th className="border-b p-2">State</th>
            <th className="border-b p-2">Urgency</th>
            <th className="border-b p-2">Location</th>
            <th className="border-b p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {list.data?.map((m) => (
            <tr key={m.id} className="border-b">
              <td className="p-2">{m.id}</td>
              <td className="p-2">{m.state}</td>
              <td className="p-2">{m.urgency}</td>
              <td className="p-2">{m.locationId}</td>
              <td className="p-2 flex gap-2">
                <button className="px-2 py-1 bg-slate-600 text-white rounded" onClick={() => startEdit(m)}>Edit</button>
                <button className="px-2 py-1 bg-red-600 text-white rounded" onClick={() => remove.mutate(m.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
