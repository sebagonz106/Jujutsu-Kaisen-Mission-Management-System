import { useState, useMemo } from 'react';
import { useSorcerers } from '../../hooks/useSorcerers';
import type { Sorcerer } from '../../types/sorcerer';
import { SORCERER_GRADE, SORCERER_STATUS } from '../../types/sorcerer';
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
  name: z.string().min(2, 'Nombre muy corto'),
  grado: z.union([
    z.literal(SORCERER_GRADE.estudiante),
    z.literal(SORCERER_GRADE.aprendiz),
    z.literal(SORCERER_GRADE.medio),
    z.literal(SORCERER_GRADE.alto),
    z.literal(SORCERER_GRADE.especial),
  ]),
  experiencia: z.coerce.number().min(0, 'No negativo'),
  estado: z.union([
    z.literal(SORCERER_STATUS.activo),
    z.literal(SORCERER_STATUS.lesionado),
    z.literal(SORCERER_STATUS.recuperandose),
    z.literal(SORCERER_STATUS.baja),
    z.literal(SORCERER_STATUS.inactivo),
  ]),
  tecnicaPrincipal: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

export const SorcerersPage = () => {
  const { list, create, update, remove } = useSorcerers();
  const [editId, setEditId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [sortKey, setSortKey] = useState<keyof Sorcerer>('id');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      grado: SORCERER_GRADE.estudiante,
      experiencia: 0,
      estado: SORCERER_STATUS.activo,
      tecnicaPrincipal: '',
    },
  });

  const openCreate = () => {
    setEditId(null);
    reset({ name: '', grado: SORCERER_GRADE.estudiante, experiencia: 0, estado: SORCERER_STATUS.activo, tecnicaPrincipal: '' });
    setShowForm(true);
  };
  const startEdit = (s: Sorcerer) => {
    setEditId(s.id);
    reset({
      name: s.name,
      grado: s.grado,
      experiencia: s.experiencia,
      estado: s.estado,
      tecnicaPrincipal: s.tecnicaPrincipal ?? '',
    });
    setShowForm(true);
  };
  const onSubmit = handleSubmit(async (values) => {
    try {
      if (editId) {
        await update.mutateAsync({ id: editId, patch: values });
        toast.success('Actualizado');
      } else {
        await create.mutateAsync(values);
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

  const toggleSort = (key: keyof Sorcerer) => {
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
  if (list.isError) return <div className="p-4 text-red-400">Error al cargar hechiceros</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
  <h1 className="page-title">Hechiceros</h1>
        <Button onClick={openCreate}>Nuevo</Button>
      </div>
      {sortedData.length === 0 ? (
        <EmptyState
          title="No hay hechiceros"
          description="Crea el primero para comenzar"
          action={<Button onClick={openCreate}>Crear hechicero</Button>}
        />
      ) : (
        <div className="card-surface p-4 overflow-x-auto">
          <Table>
            <THead>
              <tr>
                <TH><SortHeader label="ID" active={sortKey==='id'} direction={sortDir} onClick={() => toggleSort('id')} /></TH>
                <TH><SortHeader label="Nombre" active={sortKey==='name'} direction={sortDir} onClick={() => toggleSort('name')} /></TH>
                <TH><SortHeader label="Grado" active={sortKey==='grado'} direction={sortDir} onClick={() => toggleSort('grado')} /></TH>
                <TH><SortHeader label="Experiencia" active={sortKey==='experiencia'} direction={sortDir} onClick={() => toggleSort('experiencia')} /></TH>
                <TH><SortHeader label="Estado" active={sortKey==='estado'} direction={sortDir} onClick={() => toggleSort('estado')} /></TH>
                <TH>Acciones</TH>
              </tr>
            </THead>
            <TBody>
              {sortedData.map((s) => (
                <tr key={s.id} className="border-b hover:bg-slate-800/40">
                  <TD>{s.id}</TD>
                  <TD>{s.name}</TD>
                  <TD>{s.grado}</TD>
                  <TD>{s.experiencia}</TD>
                  <TD>{s.estado}</TD>
                  <TD className="flex gap-2">
                    <Button size="sm" variant="secondary" onClick={() => startEdit(s)}>Editar</Button>
                    <Button size="sm" variant="danger" onClick={() => setDeleteId(s.id)} disabled={remove.isPending}>Borrar</Button>
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
        title={editId ? 'Editar Hechicero' : 'Nuevo Hechicero'}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setShowForm(false)}>Cancelar</Button>
            <Button disabled={isSubmitting || create.isPending || update.isPending} type="submit" form="sorcerer-form">
              {editId ? 'Guardar cambios' : 'Crear'}
            </Button>
          </div>
        }
      >
        <form id="sorcerer-form" onSubmit={onSubmit} className="space-y-3">
          <Input label="Nombre" placeholder="Nombre" {...register('name')} />
          {errors.name && <p className="text-xs text-red-400">{errors.name.message}</p>}
          <Select label="Grado" {...register('grado')}>
            {Object.values(SORCERER_GRADE).map((g) => <option key={g} value={g}>{g}</option>)}
          </Select>
          <Input label="Experiencia" type="number" {...register('experiencia', { valueAsNumber: true })} />
          {errors.experiencia && <p className="text-xs text-red-400">{errors.experiencia.message}</p>}
            <Select label="Estado" {...register('estado')}>
            {Object.values(SORCERER_STATUS).map((s) => <option key={s} value={s}>{s}</option>)}
          </Select>
          <Input label="Técnica Principal" placeholder="Técnica" {...register('tecnicaPrincipal')} />
        </form>
      </Modal>

      <ConfirmDialog
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        title="Eliminar hechicero"
        description="Esta acción no se puede deshacer"
        confirmText="Eliminar"
      />
    </div>
  );
};
