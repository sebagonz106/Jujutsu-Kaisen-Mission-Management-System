/**
 * @fileoverview Missions management page with CRUD operations.
 *
 * Features:
 * - Spanish UI labels with English internal enum values
 * - Conditional field validation: 'urgency' required only for pending missions,
 *   'events' and 'collateralDamage' required only for completed missions
 * - Multi-select UI for assigning sorcerers and curses via checkboxes
 * - Role-based access control (only support and high-rank sorcerers can mutate)
 *
 * @module pages/missions/MissionsPage
 */

import { useMemo, useState } from 'react';
import { useMissions } from '../../hooks/useMissions';
import { useSorcerers } from '../../hooks/useSorcerers';
import { useCurses } from '../../hooks/useCurses';
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
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { useAuth } from '../../hooks/useAuth';
import { canMutate as canMutateByRole } from '../../utils/permissions';
import { MultiSelect } from '../../components/ui/MultiSelect';

/**
 * Maps internal mission state enum values to Spanish display labels.
 */
const estadoLabel: Record<Mission['state'], string> = {
  [MISSION_STATE.pending]: 'Pendiente',
  [MISSION_STATE.in_progress]: 'En progreso',
  [MISSION_STATE.success]: 'Completada con éxito',
  [MISSION_STATE.failure]: 'Completada con fracaso',
  [MISSION_STATE.canceled]: 'Cancelada',
};

/**
 * Maps internal mission urgency enum values to Spanish display labels.
 */
const urgenciaLabel: Record<Mission['urgency'], string> = {
  [MISSION_URGENCY.planned]: 'Planificada',
  [MISSION_URGENCY.urgent]: 'Urgente',
  [MISSION_URGENCY.critical]: 'Emergencia crítica',
};

/**
 * Zod schema for mission form validation.
 *
 * Conditional rules:
 * - `urgency` is required only when state is 'pending'
 * - `events` and `collateralDamage` are required only when state is 'success', 'failure', or 'canceled'
 */
const schema = z
  .object({
    locationId: z.coerce.number().min(0, 'El ID debe ser mayor o igual a 0'),
    state: z.union([
      z.literal(MISSION_STATE.pending),
      z.literal(MISSION_STATE.in_progress),
      z.literal(MISSION_STATE.success),
      z.literal(MISSION_STATE.failure),
      z.literal(MISSION_STATE.canceled),
    ]),
    urgency: z
      .union([
        z.literal(MISSION_URGENCY.planned),
        z.literal(MISSION_URGENCY.urgent),
        z.literal(MISSION_URGENCY.critical),
      ])
      .optional(),
    events: z.string().optional(),
    collateralDamage: z.string().optional(),
    sorcererIds: z.array(z.coerce.number()).optional(),
    curseIds: z.array(z.coerce.number()).optional(),
  })
  .superRefine((val, ctx) => {
    const isPending = val.state === MISSION_STATE.pending;
    const isFinished = [MISSION_STATE.success, MISSION_STATE.failure, MISSION_STATE.canceled].includes(val.state as typeof MISSION_STATE.success | typeof MISSION_STATE.failure | typeof MISSION_STATE.canceled);

    // Enforce urgency for pending missions
    if (isPending && !val.urgency) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['urgency'],
        message: 'La urgencia es obligatoria en misiones pendientes.',
      });
    }

    // Enforce events and collateral damage for completed missions
    if (isFinished) {
      if (!val.events || val.events.trim() === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['events'],
          message: 'Debe detallar los eventos para misiones finalizadas.',
        });
      }
      if (!val.collateralDamage || val.collateralDamage.trim() === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['collateralDamage'],
          message: 'Debe indicar los daños colaterales para misiones finalizadas.',
        });
      }
    }
  });

type FormValues = z.infer<typeof schema>;

/**
 * MissionsPage component.
 *
 * Displays a list of missions with sortable columns and provides CRUD operations.
 * Features conditional field rendering and validation based on mission state:
 * - Urgency field shown only for pending missions
 * - Events and collateral damage fields shown only for completed missions
 * - Multi-select checkboxes for assigning sorcerers and curses
 *
 * Access control: Mutations restricted to support users and high-rank sorcerers.
 */
export const MissionsPage = () => {
  const { list, create, update, remove } = useMissions();
  const { list: sorcerersQ } = useSorcerers();
  const { list: cursesQ } = useCurses();
  const { user } = useAuth();
  const canMutate = canMutateByRole(user);
  const [editId, setEditId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [sortKey, setSortKey] = useState<keyof Mission>('id');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const { register, handleSubmit, reset, watch, control, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      locationId: 0,
      state: MISSION_STATE.pending,
      urgency: MISSION_URGENCY.planned,
      events: '',
      collateralDamage: '',
      sorcererIds: [],
      curseIds: [],
    },
  });

  // Watch mission state to conditionally show/require fields
  const currentState = watch('state');
  const isPending = currentState === MISSION_STATE.pending;
  const isFinished = ([MISSION_STATE.success, MISSION_STATE.failure, MISSION_STATE.canceled] as string[]).includes(currentState);

  // Build option lists for dropdown multi-selects
  const sorcererOptions = useMemo(
    () => (sorcerersQ.data ?? []).map(s => ({ value: s.id, label: `${s.name} · ${s.grado}` })),
    [sorcerersQ.data]
  );
  const curseOptions = useMemo(
    () => (cursesQ.data ?? []).map(c => ({ value: c.id, label: `${c.nombre} · ${c.grado}` })),
    [cursesQ.data]
  );

  /**
   * Opens the create form with empty default values.
   */
  const openCreate = () => {
    setEditId(null);
    reset({ locationId: 0, state: MISSION_STATE.pending, urgency: MISSION_URGENCY.planned, events: '', collateralDamage: '', sorcererIds: [], curseIds: [] });
    setShowForm(true);
  };

  /**
   * Opens the edit form with pre-filled values from an existing mission.
   * @param m - The mission to edit.
   */
  const startEdit = (m: Mission) => {
    setEditId(m.id);
    reset({
      locationId: m.locationId,
      state: m.state,
      urgency: m.urgency,
      events: m.events,
      collateralDamage: m.collateralDamage,
      sorcererIds: m.sorcererIds,
      curseIds: m.curseIds,
    });
    setShowForm(true);
  };

  /**
   * Handles form submission for creating or updating a mission.
   * Validates conditional fields and shows success/error toasts.
   */
  const onSubmit = handleSubmit(async (values) => {
    try {
      const payload: Omit<Mission, 'id'> = {
        startAt: new Date().toISOString(),
        endAt: undefined,
        locationId: values.locationId,
        state: values.state,
        events: values.events || '',
        collateralDamage: values.collateralDamage || '',
        urgency: values.urgency as Mission['urgency'],
        sorcererIds: (values.sorcererIds ?? []) as number[],
        curseIds: (values.curseIds ?? []) as number[],
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

  /**
   * Confirms and executes mission deletion.
   * Shows success/error toasts and closes the confirmation dialog.
   */
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
  if (list.isError) return <div className="p-4 text-red-400">Error al cargar misiones</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
  <h1 className="page-title">Misiones</h1>
        {canMutate && <Button onClick={openCreate}>Nueva</Button>}
      </div>
      {(list.data?.length ?? 0) === 0 ? (
        <EmptyState title="No hay misiones" description={canMutate ? 'Crea la primera' : 'No hay registros disponibles'} action={canMutate ? <Button onClick={openCreate}>Crear misión</Button> : undefined} />
      ) : (
        <div className="card-surface p-4 overflow-x-auto">
          <Table>
            <THead>
              <tr>
                <TH><SortHeader label="ID" active={sortKey==='id'} direction={sortDir} onClick={() => toggleSort('id')} /></TH>
                <TH><SortHeader label="Estado" active={sortKey==='state'} direction={sortDir} onClick={() => toggleSort('state')} /></TH>
                <TH><SortHeader label="Urgencia" active={sortKey==='urgency'} direction={sortDir} onClick={() => toggleSort('urgency')} /></TH>
                <TH><SortHeader label="Ubicación" active={sortKey==='locationId'} direction={sortDir} onClick={() => toggleSort('locationId')} /></TH>
                {canMutate && <TH>Acciones</TH>}
              </tr>
            </THead>
            <TBody>
              {sortedData.map((m) => (
                <tr key={m.id} className="border-b hover:bg-slate-800/40">
                  <TD>{m.id}</TD>
                  <TD>{estadoLabel[m.state]}</TD>
                  <TD>{urgenciaLabel[m.urgency]}</TD>
                  <TD>{m.locationId}</TD>
                  {canMutate && (
                    <TD className="flex gap-2">
                      <Button size="sm" variant="secondary" onClick={() => startEdit(m)}>Editar</Button>
                      <Button size="sm" variant="danger" onClick={() => setDeleteId(m.id)} disabled={remove.isPending}>Borrar</Button>
                    </TD>
                  )}
                </tr>
              ))}
            </TBody>
          </Table>
        </div>
      )}

      <Modal
        open={showForm && canMutate}
        onClose={() => setShowForm(false)}
        title={editId ? 'Editar Misión' : 'Nueva Misión'}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setShowForm(false)}>Cancelar</Button>
            <Button disabled={!canMutate || isSubmitting || create.isPending || update.isPending} type="submit" form="mission-form">
              {editId ? 'Guardar cambios' : 'Crear'}
            </Button>
          </div>
        }
      >
        <form id="mission-form" onSubmit={onSubmit} className="space-y-3">
          <Input label="ID de ubicación" type="number" {...register('locationId', { valueAsNumber: true })} />
          {errors.locationId && <p className="text-xs text-red-400">{errors.locationId.message}</p>}
          <Select label="Estado" {...register('state')}>
            {Object.values(MISSION_STATE).map(s => (
              <option key={s} value={s}>{estadoLabel[s]}</option>
            ))}
          </Select>
          {/* Urgencia solo cuando está Pendiente */}
          {isPending && (
            <>
              <Select label="Urgencia" {...register('urgency')}>
                {Object.values(MISSION_URGENCY).map(u => (
                  <option key={u} value={u}>{urgenciaLabel[u]}</option>
                ))}
              </Select>
              {errors.urgency && <p className="text-xs text-red-400">{errors.urgency.message}</p>}
            </>
          )}

          {/* Campos solo para misiones finalizadas */}
          {isFinished && (
            <>
              <Input label="Eventos" placeholder="Eventos" {...register('events')} />
              {errors.events && <p className="text-xs text-red-400">{errors.events.message}</p>}
              <Input label="Daños colaterales" placeholder="Detalles" {...register('collateralDamage')} />
              {errors.collateralDamage && <p className="text-xs text-red-400">{errors.collateralDamage.message}</p>}
            </>
          )}
          {/* Dropdown multi-selects for sorcerers and curses */}
          <Controller
            name="sorcererIds"
            control={control}
            render={({ field }) => (
              <MultiSelect
                label="Hechiceros asignados"
                options={sorcererOptions}
                value={field.value ?? []}
                onChange={field.onChange}
                disabled={sorcerersQ.isLoading || !!sorcerersQ.isError}
                placeholder={sorcerersQ.isLoading ? 'Cargando...' : (sorcerersQ.isError ? 'Error al cargar' : 'Seleccionar...')}
              />
            )}
          />

          <Controller
            name="curseIds"
            control={control}
            render={({ field }) => (
              <MultiSelect
                label="Maldiciones asociadas"
                options={curseOptions}
                value={field.value ?? []}
                onChange={field.onChange}
                disabled={cursesQ.isLoading || !!cursesQ.isError}
                placeholder={cursesQ.isLoading ? 'Cargando...' : (cursesQ.isError ? 'Error al cargar' : 'Seleccionar...')}
              />
            )}
          />
        </form>
      </Modal>

      <ConfirmDialog
        open={deleteId !== null && canMutate}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        title="Eliminar misión"
        description="Esta acción no se puede deshacer"
        confirmText="Eliminar"
      />
    </div>
  );
};
