import { useMemo, useState } from 'react';
import { useCurses } from '../../hooks/useCurses';
import type { Curse } from '../../types/curse';
import { CURSE_GRADE, CURSE_TYPE, CURSE_STATE, CURSE_DANGER_LEVEL } from '../../types/curse';
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
  nombre: z.string().min(2, 'Nombre muy corto'),
  ubicacionDeAparicion: z.string().min(2, 'Ubicación requerida'),
  fechaYHoraDeAparicion: z.string(),
  grado: z.union([
    z.literal(CURSE_GRADE.grado_1),
    z.literal(CURSE_GRADE.grado_2),
    z.literal(CURSE_GRADE.grado_3),
    z.literal(CURSE_GRADE.semi_especial),
    z.literal(CURSE_GRADE.especial),
  ]),
  tipo: z.union([
    z.literal(CURSE_TYPE.maligna),
    z.literal(CURSE_TYPE.semi_maldicion),
    z.literal(CURSE_TYPE.residual),
    z.literal(CURSE_TYPE.desconocida),
  ]),
  estadoActual: z.union([
    z.literal(CURSE_STATE.activa),
    z.literal(CURSE_STATE.en_proceso_de_exorcismo),
    z.literal(CURSE_STATE.exorcisada),
  ]),
  nivelPeligro: z.union([
    z.literal(CURSE_DANGER_LEVEL.bajo),
    z.literal(CURSE_DANGER_LEVEL.moderado),
    z.literal(CURSE_DANGER_LEVEL.alto),
  ]),
});
type FormValues = z.infer<typeof schema>;

export const CursesPage = () => {
  const { list, create, update, remove } = useCurses();
  const [editId, setEditId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [sortKey, setSortKey] = useState<keyof Curse>('id');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      nombre: '',
      ubicacionDeAparicion: '',
      grado: CURSE_GRADE.grado_1,
      tipo: CURSE_TYPE.maligna,
      estadoActual: CURSE_STATE.activa,
      nivelPeligro: CURSE_DANGER_LEVEL.bajo,
      fechaYHoraDeAparicion: new Date().toISOString(),
    },
  });

  const openCreate = () => {
    setEditId(null);
    reset({ nombre: '', ubicacionDeAparicion: '', grado: CURSE_GRADE.grado_1, tipo: CURSE_TYPE.maligna, estadoActual: CURSE_STATE.activa, nivelPeligro: CURSE_DANGER_LEVEL.bajo, fechaYHoraDeAparicion: new Date().toISOString() });
    setShowForm(true);
  };
  const startEdit = (c: Curse) => {
    setEditId(c.id);
    reset({
      nombre: c.nombre,
      ubicacionDeAparicion: c.ubicacionDeAparicion,
      grado: c.grado,
      tipo: c.tipo,
      estadoActual: c.estadoActual,
      nivelPeligro: c.nivelPeligro,
      fechaYHoraDeAparicion: c.fechaYHoraDeAparicion,
    });
    setShowForm(true);
  };
  const onSubmit = handleSubmit(async (values) => {
    try {
      const payload: Omit<Curse, 'id'> = {
        nombre: values.nombre,
        ubicacionDeAparicion: values.ubicacionDeAparicion,
        grado: values.grado,
        tipo: values.tipo,
        estadoActual: values.estadoActual,
        nivelPeligro: values.nivelPeligro,
        fechaYHoraDeAparicion: values.fechaYHoraDeAparicion,
      };
      if (editId) {
        await update.mutateAsync({ id: editId, patch: payload });
        toast.success('Actualizado');
      } else {
        await create.mutateAsync(payload);
        toast.success('Creado');
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
        toast.success('Eliminado');
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

  const toggleSort = (key: keyof Curse) => {
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
  if (list.isError) return <div className="p-4 text-red-400">Error al cargar maldiciones</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
  <h1 className="page-title">Maldiciones</h1>
        <Button onClick={openCreate}>Nueva</Button>
      </div>
      {sortedData.length === 0 ? (
        <EmptyState title="No hay maldiciones" description="Crea la primera para comenzar" action={<Button onClick={openCreate}>Crear maldición</Button>} />
      ) : (
        <div className="card-surface p-4 overflow-x-auto">
          <Table>
            <THead>
              <tr>
                <TH><SortHeader label="ID" active={sortKey==='id'} direction={sortDir} onClick={() => toggleSort('id')} /></TH>
                <TH><SortHeader label="Nombre" active={sortKey==='nombre'} direction={sortDir} onClick={() => toggleSort('nombre')} /></TH>
                <TH><SortHeader label="Grado" active={sortKey==='grado'} direction={sortDir} onClick={() => toggleSort('grado')} /></TH>
                <TH><SortHeader label="Tipo" active={sortKey==='tipo'} direction={sortDir} onClick={() => toggleSort('tipo')} /></TH>
                <TH><SortHeader label="Estado" active={sortKey==='estadoActual'} direction={sortDir} onClick={() => toggleSort('estadoActual')} /></TH>
                <TH><SortHeader label="Peligro" active={sortKey==='nivelPeligro'} direction={sortDir} onClick={() => toggleSort('nivelPeligro')} /></TH>
                <TH>Acciones</TH>
              </tr>
            </THead>
            <TBody>
              {sortedData.map((c) => (
                <tr key={c.id} className="border-b hover:bg-slate-800/40">
                  <TD>{c.id}</TD>
                  <TD>{c.nombre}</TD>
                  <TD>{c.grado}</TD>
                  <TD>{c.tipo}</TD>
                  <TD>{c.estadoActual}</TD>
                  <TD>{c.nivelPeligro}</TD>
                  <TD className="flex gap-2">
                    <Button size="sm" variant="secondary" onClick={() => startEdit(c)}>Editar</Button>
                    <Button size="sm" variant="danger" onClick={() => setDeleteId(c.id)} disabled={remove.isPending}>Borrar</Button>
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
        title={editId ? 'Editar Maldición' : 'Nueva Maldición'}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setShowForm(false)}>Cancelar</Button>
            <Button disabled={isSubmitting || create.isPending || update.isPending} type="submit" form="curse-form">
              {editId ? 'Guardar cambios' : 'Crear'}
            </Button>
          </div>
        }
      >
        <form id="curse-form" onSubmit={onSubmit} className="space-y-3">
          <Input label="Nombre" placeholder="Nombre" {...register('nombre')} />
          {errors.nombre && <p className="text-xs text-red-400">{errors.nombre.message}</p>}
          <Input label="Ubicación" placeholder="Ubicación" {...register('ubicacionDeAparicion')} />
          {errors.ubicacionDeAparicion && <p className="text-xs text-red-400">{errors.ubicacionDeAparicion.message}</p>}
          <Select label="Grado" {...register('grado')}>
            {Object.values(CURSE_GRADE).map((g) => <option key={g} value={g}>{g}</option>)}
          </Select>
          <Select label="Tipo" {...register('tipo')}>
            {Object.values(CURSE_TYPE).map((t) => <option key={t} value={t}>{t}</option>)}
          </Select>
          <Select label="Estado" {...register('estadoActual')}>
            {Object.values(CURSE_STATE).map((s) => <option key={s} value={s}>{s}</option>)}
          </Select>
          <Select label="Peligro" {...register('nivelPeligro')}>
            {Object.values(CURSE_DANGER_LEVEL).map((n) => <option key={n} value={n}>{n}</option>)}
          </Select>
        </form>
      </Modal>

      <ConfirmDialog
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        title="Eliminar maldición"
        description="Esta acción no se puede deshacer"
        confirmText="Eliminar"
      />
    </div>
  );
};
