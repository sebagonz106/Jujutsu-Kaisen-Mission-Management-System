import { useMemo, useState } from 'react';
import { useMissions } from '../../hooks/useMissions';
import type { Mission } from '../../types/mission';
import { MISSION_STATE, MISSION_URGENCY } from '../../types/mission';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { EmptyState } from '../../components/ui/EmptyState';
import { Table, THead, TBody, TH, TD, SortHeader } from '../../components/ui/Table';
import { Skeleton } from '../../components/ui/Skeleton';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

const schema = z.object({
  locationId: z.coerce.number().min(0, 'ID >= 0'),
  state: z.union([
    z.literal(MISSION_STATE.pending),
    z.literal(MISSION_STATE.in_progress),
    z.literal(MISSION_STATE.success),
    z.literal(MISSION_STATE.failure),
    z.literal(MISSION_STATE.canceled),
  ]),
  urgency: z.union([
    z.literal(MISSION_URGENCY.planned),
    z.literal(MISSION_URGENCY.urgent),
    z.literal(MISSION_URGENCY.critical),
  ]),
  events: z.string().optional(),
  collateralDamage: z.string().optional(),
  sorcererIds: z.string().optional(), // comma separated
  curseIds: z.string().optional(), // comma separated
});
type FormValues = z.infer<typeof schema>;

export const MissionsPage = () => {
  const { list, create, update, remove } = useMissions();
  const [editId, setEditId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [sortKey, setSortKey] = useState<keyof Mission>('id');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      locationId: 0,
      state: MISSION_STATE.pending,
      urgency: MISSION_URGENCY.planned,
      events: '',
      collateralDamage: '',
      sorcererIds: '',
      curseIds: '',
    },
  });

  const openCreate = () => {
    setEditId(null);
    reset({ locationId: 0, state: MISSION_STATE.pending, urgency: MISSION_URGENCY.planned, events: '', collateralDamage: '', sorcererIds: '', curseIds: '' });
    setShowForm(true);
  };
  const startEdit = (m: Mission) => {
    setEditId(m.id);
    reset({
      locationId: m.locationId,
      state: m.state,
      urgency: m.urgency,
      events: m.events,
      collateralDamage: m.collateralDamage,
      sorcererIds: m.sorcererIds.join(','),
      curseIds: m.curseIds.join(','),
    });
    setShowForm(true);
  };
  const parseIds = (value?: string): number[] =>
    value ? value.split(',').map(v => v.trim()).filter(v => v.length>0).map(v => Number(v)).filter(n => !Number.isNaN(n)) : [];
  const onSubmit = handleSubmit(async (values) => {
    try {
      const payload: Omit<Mission, 'id'> = {
        startAt: new Date().toISOString(),
        endAt: undefined,
        locationId: values.locationId,
        state: values.state,
        events: values.events || '',
        collateralDamage: values.collateralDamage || '',
        urgency: values.urgency,
        sorcererIds: parseIds(values.sorcererIds),
        curseIds: parseIds(values.curseIds),
      };
      if (editId) {
        await update.mutateAsync({ id: editId, patch: payload });
        toast.success('Actualizada');
      } else {
        await create.mutateAsync(payload);
        toast.success('Creada');
      }
      setShowForm(false);
    } catch {
      toast.error('Error al guardar');
    }
  });
  const confirmDelete = async () => {
    if (deleteId) {
      try {
        await remove.mutateAsync(deleteId);
        toast.success('Eliminada');
      } catch {
        toast.error('Error al eliminar');
      }
      setDeleteId(null);
    }
  };

  const sortedData = useMemo(() => {
    const data = list.data ?? [];
    return [...data].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (typeof av === 'number' && typeof bv === 'number') return sortDir === 'asc' ? av - bv : bv - av;
      return sortDir === 'asc'
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av));
    });
  }, [list.data, sortKey, sortDir]);

  const toggleSort = (key: keyof Mission) => {
    if (sortKey === key) setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  if (list.isLoading) return (
    <div className="p-4 space-y-4">
      <Skeleton className="h-8 w-40" />
      <div className="space-y-2">
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-full" />
      </div>
    </div>
  );
  if (list.isError) return <div className="p-4 text-red-400">Error loading missions</div>;

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Missions</h1>
        <Button onClick={openCreate}>Nueva</Button>
      </div>
      {(list.data?.length ?? 0) === 0 ? (
        <EmptyState title="No hay missions" description="Crea la primera" action={<Button onClick={openCreate}>Crear mission</Button>} />
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <THead>
              <tr>
                <TH><SortHeader label="ID" active={sortKey==='id'} direction={sortDir} onClick={() => toggleSort('id')} /></TH>
                <TH><SortHeader label="Estado" active={sortKey==='state'} direction={sortDir} onClick={() => toggleSort('state')} /></TH>
                <TH><SortHeader label="Urgencia" active={sortKey==='urgency'} direction={sortDir} onClick={() => toggleSort('urgency')} /></TH>
                <TH><SortHeader label="Loc" active={sortKey==='locationId'} direction={sortDir} onClick={() => toggleSort('locationId')} /></TH>
                <TH>Acciones</TH>
              </tr>
            </THead>
            <TBody>
              {sortedData.map((m) => (
                <tr key={m.id} className="border-b hover:bg-slate-800/40">
                  <TD>{m.id}</TD>
                  <TD>{m.state}</TD>
                  <TD>{m.urgency}</TD>
                  <TD>{m.locationId}</TD>
                  <TD className="flex gap-2">
                    <Button size="sm" variant="secondary" onClick={() => startEdit(m)}>Editar</Button>
                    <Button size="sm" variant="danger" onClick={() => setDeleteId(m.id)} disabled={remove.isPending}>Borrar</Button>
                  </TD>
                </tr>
              ))}
            </TBody>
          </Table>
        </div>
      )}

      <Modal
        open={showForm}
        onClose={() => setShowForm(false)}
        title={editId ? 'Editar Mission' : 'Nueva Mission'}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setShowForm(false)}>Cancelar</Button>
            <Button disabled={isSubmitting || create.isPending || update.isPending} type="submit" form="mission-form">
              {editId ? 'Guardar cambios' : 'Crear'}
            </Button>
          </div>
        }
      >
        <form id="mission-form" onSubmit={onSubmit} className="space-y-3">
          <Input label="Location ID" type="number" {...register('locationId', { valueAsNumber: true })} />
          {errors.locationId && <p className="text-xs text-red-400">{errors.locationId.message}</p>}
          <Select label="Estado" {...register('state')}>
            {Object.values(MISSION_STATE).map(s => <option key={s} value={s}>{s}</option>)}
          </Select>
          <Select label="Urgencia" {...register('urgency')}>
            {Object.values(MISSION_URGENCY).map(u => <option key={u} value={u}>{u}</option>)}
          </Select>
          <Input label="Events" placeholder="Eventos" {...register('events')} />
          <Input label="Collateral Damage" placeholder="Daños colaterales" {...register('collateralDamage')} />
          <Input label="Sorcerer IDs" placeholder="Ej: 1,2,3" {...register('sorcererIds')} />
          <Input label="Curse IDs" placeholder="Ej: 1,2" {...register('curseIds')} />
        </form>
      </Modal>

      <ConfirmDialog
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        title="Eliminar mission"
        description="Esta acción no se puede deshacer"
        confirmText="Eliminar"
      />
    </div>
  );
};
