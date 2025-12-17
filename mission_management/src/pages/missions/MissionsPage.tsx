/**
 * @fileoverview Missions management page with CRUD operations.
 *
 * Features:
 * - Spanish UI labels with English internal enum values
 * - Conditional field validation based on modal-selected state
 * - State transitions controlled by DB mission state (not modal watch)
 * - Multi-select UI for assigning sorcerers with name-only display and search
 * - Readonly fields displayed as plain text (not disabled inputs)
 * - Role-based access control (only support and high-rank sorcerers can mutate)
 *
 * @module pages/missions/MissionsPage
 */

import { useMemo, useState } from 'react';
import { useMissions } from '../../hooks/useMissions';
import { missionApi } from '../../api/missionApi';
import { useInfiniteMissions } from '../../hooks/useInfiniteMissions';
import type { PagedResponse } from '../../api/pagedApi';
import { useSorcerers } from '../../hooks/useSorcerers';
import { useCurses } from '../../hooks/useCurses';
import { useLocations } from '../../hooks/useLocations';
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
import { t } from '../../i18n';
import { MultiSelect } from '../../components/ui/MultiSelect';

/**
 * Determines allowed state transitions based on current DB mission state.
 * Not based on modal-selected state.
 */
const getAllowedTransitions = (currentDbState: Mission['state']): Mission['state'][] => {
  switch (currentDbState) {
    case MISSION_STATE.pending:
      return [MISSION_STATE.pending, MISSION_STATE.in_progress, MISSION_STATE.canceled];
    case MISSION_STATE.in_progress:
      return [MISSION_STATE.in_progress, MISSION_STATE.success, MISSION_STATE.failure, MISSION_STATE.canceled];
    case MISSION_STATE.success:
    case MISSION_STATE.failure:
    case MISSION_STATE.canceled:
      return [currentDbState]; // No transitions allowed
    default:
      return [currentDbState];
  }
};

/**
 * Maps internal mission state enum values to Spanish display labels.
 */
const estadoLabel: Record<Mission['state'], string> = {
  [MISSION_STATE.pending]: t('mission.state.pending'),
  [MISSION_STATE.in_progress]: t('mission.state.in_progress'),
  [MISSION_STATE.success]: t('mission.state.success'),
  [MISSION_STATE.failure]: t('mission.state.failure'),
  [MISSION_STATE.canceled]: t('mission.state.canceled'),
};

/**
 * Maps internal mission urgency enum values to Spanish display labels.
 */
const urgenciaLabel: Record<Mission['urgency'], string> = {
  [MISSION_URGENCY.planned]: t('mission.urgency.planned'),
  [MISSION_URGENCY.urgent]: t('mission.urgency.urgent'),
  [MISSION_URGENCY.critical]: t('mission.urgency.critical'),
};

/**
 * Helper to format Date to datetime-local input format (YYYY-MM-DDTHH:mm)
 */
const toDateTimeLocal = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString().slice(0, 16);
};

/**
 * Zod schema for mission form validation.
 *
 * Conditional rules based on MODAL-selected state (watch('state')):
 * - `sorcererIds` must have >= 1 when state changes to 'in_progress' from pending
 * - `events` and `collateralDamage` required when state is finalized
 * - `startAt` and `endAt` can be edited in all states (no future restriction)
 * - `endAt` must be after `startAt` when in finished states
 */
const schema = z
  .object({
    startAt: z.string().min(1, t('form.validation.startDateRequired')),
    endAt: z.string().optional(),
    locationId: z.coerce.number().int().positive(t('form.validation.locationRequired')),
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
    curseId: z.coerce.number().optional(),
  })
  .superRefine((val, ctx) => {
    const isFinished = [MISSION_STATE.success, MISSION_STATE.failure, MISSION_STATE.canceled].includes(
      val.state as typeof MISSION_STATE.success | typeof MISSION_STATE.failure | typeof MISSION_STATE.canceled
    );

    // Enforce endAt for finished missions and validate it's after startAt
    if (isFinished) {
      if (!val.endAt || val.endAt.trim() === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['endAt'],
          message: t('form.validation.endDateRequiredFinished'),
        });
      } else if (val.startAt) {
        const startDate = new Date(val.startAt);
        const endDate = new Date(val.endAt);
        if (endDate <= startDate) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['endAt'],
            message: t('form.validation.endDateAfterStart'),
          });
        }
      }
      // Enforce events and collateral damage for completed missions
      if (!val.events || val.events.trim() === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['events'],
          message: t('form.validation.eventsRequiredFinished'),
        });
      }
      if (!val.collateralDamage || val.collateralDamage.trim() === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['collateralDamage'],
          message: t('form.validation.collateralRequiredFinished'),
        });
      }
    }

    // Enforce >= 1 sorcerer when changing to in_progress
    if (val.state === MISSION_STATE.in_progress && (!val.sorcererIds || val.sorcererIds.length === 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['sorcererIds'],
        message: t('form.validation.sorcerersRequiredInProgress') || 'At least 1 sorcerer required',
      });
    }
  });

type FormValues = z.infer<typeof schema>;

/**
 * MissionsPage component.
 *
 * Displays a list of missions with ID column, sortable columns and CRUD operations.
 * Modal behavior:
 * - Readonly fields shown as plain text (no inputs)
 * - State transitions controlled by current DB mission state
 * - All other fields' visibility/editability controlled by modal-selected state
 * - Multiselect sorcerers with name-only display and typeahead search
 *
 * Access control: Mutations restricted to support users and high-rank sorcerers.
 */
export const MissionsPage = () => {
  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteMissions({ pageSize: 20 });
  const { list, create, update, remove } = useMissions();
  const { list: sorcerersQ } = useSorcerers();
  const { list: cursesQ } = useCurses();
  const { list: locationsQ } = useLocations();
  const { user } = useAuth();
  const canMutate = canMutateByRole(user);
  const [editId, setEditId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [sortKey, setSortKey] = useState<keyof Mission>('id');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [sorcererSearchTerm, setSorcererSearchTerm] = useState('');
  const [currentCurse, setCurrentCurse] = useState<{ id: number; nombre: string; grado: string; estadoActual: string } | null>(null);

  const { register, handleSubmit, reset, watch, control, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      startAt: toDateTimeLocal(new Date()),
      endAt: toDateTimeLocal(new Date()),
      locationId: undefined as unknown as number,
      state: MISSION_STATE.pending,
      urgency: MISSION_URGENCY.planned,
      events: '',
      collateralDamage: '',
      sorcererIds: [],
      curseId: undefined as unknown as number,
    },
  });

  // Watch modal-selected state for conditional field rendering
  const watchedState = watch('state');
  const watchedSorcererIds = watch('sorcererIds');
  
  // Get current mission from DB (for determining allowed state transitions)
  const currentMission = editId 
    ? (Array.isArray(list.data)
        ? list.data.find(m => m.id === editId)
        : (list.data as PagedResponse<Mission> | undefined)?.items?.find(m => m.id === editId))
    : null;

  // Modal-selected state flags (for UI rendering)
  const isPendingInModal = watchedState === MISSION_STATE.pending;
  const isInProgressInModal = watchedState === MISSION_STATE.in_progress;
  const isFinishedInModal = [MISSION_STATE.success, MISSION_STATE.failure, MISSION_STATE.canceled].includes(watchedState);

  // Allowed state transitions based on DB mission state
  const allowedStates = currentMission ? getAllowedTransitions(currentMission.state) : Object.values(MISSION_STATE);

  // Build option lists for multi-selects
  const allSorcerers = useMemo(() => {
    return Array.isArray(sorcerersQ.data)
      ? sorcerersQ.data
      : (sorcerersQ.data as PagedResponse<import('../../types/sorcerer').Sorcerer> | undefined)?.items ?? [];
  }, [sorcerersQ.data]);

  // Sorcerer options filtered by search term (name only, no grade shown)
  const sorcererOptions = useMemo(() => {
    return allSorcerers
      .filter(s => s.name.toLowerCase().includes(sorcererSearchTerm.toLowerCase()))
      .map((s) => ({ value: s.id, label: s.name }));
  }, [allSorcerers, sorcererSearchTerm]);

  const curseOptions = useMemo(() => {
    const list = Array.isArray(cursesQ.data)
      ? cursesQ.data
      : (cursesQ.data as PagedResponse<import('../../types/curse').Curse> | undefined)?.items ?? [];
    return list.map((c) => ({ value: c.id, label: c.nombre }));
  }, [cursesQ.data]);

  const locationOptions = useMemo(() => {
    const list = Array.isArray(locationsQ.data)
      ? locationsQ.data
      : (locationsQ.data as PagedResponse<import('../../types/location').Location> | undefined)?.items ?? [];
    return list.map((l) => ({ value: l.id, label: l.nombre }));
  }, [locationsQ.data]);

  /**
   * Opens the create form with empty default values.
   */
  const openCreate = () => {
    setEditId(null);
    setSorcererSearchTerm('');
    reset({ 
      startAt: toDateTimeLocal(new Date()),
      endAt: toDateTimeLocal(new Date()),
      locationId: undefined as unknown as number, 
      state: MISSION_STATE.pending, 
      urgency: MISSION_URGENCY.planned, 
      events: '', 
      collateralDamage: '', 
      sorcererIds: [], 
      curseId: undefined as unknown as number
    });
    setShowForm(true);
  };

  /**
   * Opens the edit form with pre-filled values from an existing mission.
   * Preselects hechiceros (sorcerers) associated with the mission.
   * @param m - The mission to edit.
   */
  const startEdit = async (m: Mission) => {
    setEditId(m.id);
    setSorcererSearchTerm('');

    // Fetch detailed mission (includes assigned hechicero ids and associated maldicion)
    try {
      const detail = await missionApi.getDetail(m.id);
      const mm = detail.mission;
      const isFinishedMission = [MISSION_STATE.success, MISSION_STATE.failure, MISSION_STATE.canceled].includes(mm.state);
      reset({
        startAt: mm.startAt ? toDateTimeLocal(mm.startAt) : toDateTimeLocal(new Date()),
        endAt: mm.endAt ? toDateTimeLocal(mm.endAt) : (isFinishedMission ? toDateTimeLocal(new Date()) : toDateTimeLocal(new Date())),
        locationId: mm.locationId,
        state: mm.state,
        urgency: mm.urgency,
        events: mm.events,
        collateralDamage: mm.collateralDamage,
        sorcererIds: detail.hechiceroIds && detail.hechiceroIds.length > 0 ? detail.hechiceroIds : [],
        curseId: mm.curseId ?? undefined,
      });
      setCurrentCurse(detail.maldicion ?? null);
    } catch (err) {
      // fallback to minimal prefill
      const isFinishedMission = [MISSION_STATE.success, MISSION_STATE.failure, MISSION_STATE.canceled].includes(m.state);
      reset({
        startAt: m.startAt ? toDateTimeLocal(m.startAt) : toDateTimeLocal(new Date()),
        endAt: m.endAt ? toDateTimeLocal(m.endAt) : (isFinishedMission ? toDateTimeLocal(new Date()) : toDateTimeLocal(new Date())),
        locationId: m.locationId,
        state: m.state,
        urgency: m.urgency,
        events: m.events,
        collateralDamage: m.collateralDamage,
        sorcererIds: m.sorcererIds && m.sorcererIds.length > 0 ? m.sorcererIds : [],
        curseId: (m as any).curseId ?? undefined,
      });
      setCurrentCurse(null);
    }

    setShowForm(true);
  };

  /**
   * Handles form submission for creating or updating a mission.
   * Constructs appropriate payload based on state and sends via useMissions.update.
   * Shows success/error toasts.
   */
  const onSubmit = handleSubmit(async (values) => {
    try {
      if (editId) {
        // UPDATE: construct payload based on current DB state and modal-selected state
        const payload: any = {
          estado: values.state,
        };

        // Include hechicerosIds when in EnProgreso or changing to EnProgreso
        if (values.state === MISSION_STATE.in_progress || watchedState === MISSION_STATE.in_progress) {
          payload.hechicerosIds = values.sorcererIds && values.sorcererIds.length > 0 ? values.sorcererIds : [];
        }

        // Include locationId when transitioning to EnProgreso
        if (values.state === MISSION_STATE.in_progress && currentMission?.state === MISSION_STATE.pending) {
          payload.ubicacionId = values.locationId;
        }

        // Include events and collateralDamage when in finished states
        const isFinished = [MISSION_STATE.success, MISSION_STATE.failure, MISSION_STATE.canceled].includes(values.state);
        if (isFinished) {
          payload.eventosOcurridos = values.events || '';
          payload.dannosColaterales = values.collateralDamage || '';
        }

        const response = await update.mutateAsync({ id: editId, patch: payload });
        
        if (response?.generatedData?.hechicerosEnMisionIds) {
          toast.success(
            `${t('toast.mission.updated')} (${response.generatedData.hechicerosEnMisionIds.length} hechiceros nuevos)`
          );
        } else {
          toast.success(t('toast.mission.updated'));
        }
      } else {
        // CREATE: build full mission object
        const payload: Omit<Mission, 'id'> = {
          startAt: new Date(values.startAt).toISOString(),
          endAt: values.endAt ? new Date(values.endAt).toISOString() : undefined,
          locationId: values.locationId,
          state: values.state,
          events: values.events || '',
          collateralDamage: values.collateralDamage || '',
          urgency: (values.urgency ?? MISSION_URGENCY.planned) as Mission['urgency'],
          sorcererIds: (values.sorcererIds ?? []) as number[],
            curseId: values.curseId ?? undefined,
        };
        await create.mutateAsync(payload);
        toast.success(t('toast.mission.created'));
      }
      setShowForm(false);
      setSorcererSearchTerm('');
    } catch (error: any) {
      toast.error(error?.message || t('toast.saveError'));
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
        toast.success(t('toast.mission.deleted'));
      } catch {
        toast.error(t('toast.deleteError'));
      }
      setDeleteId(null);
    }
  };

  const flat = useMemo(() => (data?.pages ?? []).flatMap((p) => p.items), [data]);
  const sortedData = useMemo(() => {
    const base: Mission[] = flat.length
      ? flat
      : Array.isArray(list.data)
        ? list.data
        : (list.data as PagedResponse<Mission> | undefined)?.items ?? [];
    return [...base].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (typeof av === 'number' && typeof bv === 'number') return sortDir === 'asc' ? av - bv : bv - av;
      return sortDir === 'asc'
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av));
    });
  }, [flat, list.data, sortKey, sortDir]);
  const locationNameById = useMemo(() => {
    const list = Array.isArray(locationsQ.data)
      ? locationsQ.data
      : (locationsQ.data as PagedResponse<import('../../types/location').Location> | undefined)?.items ?? [];
    const map = new Map<number, string>();
    for (const l of list) map.set(l.id, l.nombre);
    return map;
  }, [locationsQ.data]);

  const curseNameById = useMemo(() => {
    const list = Array.isArray(cursesQ.data)
      ? cursesQ.data
      : (cursesQ.data as PagedResponse<import('../../types/curse').Curse> | undefined)?.items ?? [];
    const map = new Map<number, { nombre: string; grado: string }>();
    for (const c of list) map.set(c.id, { nombre: c.nombre, grado: c.grado });
    return map;
  }, [cursesQ.data]);

  const toggleSort = (key: keyof Mission) => {
    if (sortKey === key) setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  if (isLoading) return (
    <div className="p-4 space-y-4">
      <Skeleton className="h-8 w-40" />
      <div className="space-y-2">
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-full" />
      </div>
    </div>
  );
  if (isError) return <div className="p-4 text-red-400">{t('errors.loadMissions')}</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
  <h1 className="page-title">{t('pages.missions.title')}</h1>
      </div>
  {(sortedData.length ?? 0) === 0 ? (
  <EmptyState title={t('pages.missions.emptyTitle')} description={canMutate ? t('pages.missions.emptyDescHasPerms') : t('pages.missions.emptyDescNoPerms')} />
      ) : (
        <div className="card-surface p-4 overflow-x-auto">
          <Table>
            <THead>
              <tr>
                <TH><SortHeader label="Número" active={sortKey==='id'} direction={sortDir} onClick={() => toggleSort('id')} /></TH>
                <TH><SortHeader label={t('form.labels.state')} active={sortKey==='state'} direction={sortDir} onClick={() => toggleSort('state')} /></TH>
                <TH><SortHeader label={t('form.labels.urgency')} active={sortKey==='urgency'} direction={sortDir} onClick={() => toggleSort('urgency')} /></TH>
                <TH><SortHeader label={t('form.labels.curse')} active={sortKey==='curseId'} direction={sortDir} onClick={() => toggleSort('curseId' as any)} /></TH>
                <TH><SortHeader label={t('form.labels.startDate')} active={sortKey==='startAt'} direction={sortDir} onClick={() => toggleSort('startAt')} /></TH>
                <TH><SortHeader label={t('form.labels.endDate')} active={sortKey==='endAt'} direction={sortDir} onClick={() => toggleSort('endAt')} /></TH>
                {canMutate && <TH>{t('ui.actions')}</TH>}
              </tr>
            </THead>
            <TBody>
              {sortedData.map((m) => (
                <tr key={m.id} className="border-b hover:bg-slate-800/40">
                  <TD className="font-mono font-semibold">{m.id}</TD>
                  <TD>{estadoLabel[m.state]}</TD>
                  <TD>{urgenciaLabel[m.urgency]}</TD>
                  <TD>
                    {typeof (m as any).curseId === 'number' ? (
                      (() => {
                        const cid = (m as any).curseId as number;
                        const c = curseNameById.get(cid);
                        return c ? `${c.nombre} · ${c.grado}` : `#${cid}`;
                      })()
                    ) : '-'}
                  </TD>
                  <TD>{m.startAt ? new Date(m.startAt).toLocaleString() : '-'}</TD>
                  <TD>{m.endAt ? new Date(m.endAt).toLocaleString() : '-'}</TD>
                  {canMutate && (
                    <TD className="flex gap-2">
                      <Button size="sm" variant="secondary" onClick={() => void startEdit(m)}>{t('ui.edit')}</Button>
                      <Button size="sm" variant="danger" onClick={() => setDeleteId(m.id)} disabled={remove.isPending}>{t('ui.delete')}</Button>
                    </TD>
                  )}
                </tr>
              ))}
            </TBody>
          </Table>
        </div>
      )}
      {sortedData.length > 0 && hasNextPage && (
        <div className="pt-3">
          <Button
            variant="secondary"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
          >
            {isFetchingNextPage ? t('ui.loadingMore') : t('ui.loadMore')}
          </Button>
        </div>
      )}

      <Modal
        open={showForm && canMutate}
        onClose={() => {
          setShowForm(false);
          setSorcererSearchTerm('');
        }}
        title={editId ? `${t('ui.edit')} ${t('pages.missions.singular')}` : `${t('ui.new_fem')} ${t('pages.missions.singular')}`}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => {
              setShowForm(false);
              setSorcererSearchTerm('');
            }}>{t('ui.cancel')}</Button>
            <Button disabled={!canMutate || isSubmitting || create.isPending || update.isPending} type="submit" form="mission-form">
              {editId ? t('ui.saveChanges') : t('ui.create')}
            </Button>
          </div>
        }
      >
        <form id="mission-form" onSubmit={onSubmit} className="space-y-3">
          {/* Fecha Inicio - ALWAYS EDITABLE */}
          <div>
            <label className="block text-sm font-medium mb-1">{t('form.labels.startDate')}</label>
            <Input 
              type="datetime-local" 
              {...register('startAt')} 
            />
            {errors.startAt && <p className="text-xs text-red-400">{errors.startAt.message}</p>}
          </div>

          {/* Maldición asociada - ALWAYS READONLY (shown as text) */}
          <div>
            <label className="block text-sm font-medium mb-1">Maldición asociada</label>
            <p className="text-sm text-gray-300">
              {currentCurse ? currentCurse.nombre : (currentMission ? '-' : '-')}
            </p>
          </div>

          {/* Urgencia - ALWAYS READONLY (shown as text) */}
          <div>
            <label className="block text-sm font-medium mb-1">{t('form.mission.urgency')}</label>
            <p className="text-sm text-gray-300">
              {currentMission ? urgenciaLabel[currentMission.urgency] : '-'}
            </p>
          </div>
          {/* Estado - EDITABLE with transitions limited by DB state */}
          <div>
            <label className="block text-sm font-medium mb-1">{t('form.mission.state')}</label>
            <Select {...register('state')}>
              {allowedStates.map(s => (
                <option key={s} value={s}>{estadoLabel[s]}</option>
              ))}
            </Select>
          </div>

          {/* Hechiceros Asignados - EDITABLE with search */}
          <div>
            <label className="block text-sm font-medium mb-1">Hechiceros asignados</label>
            <Input
              type="text"
              placeholder="Buscar hechicero..."
              value={sorcererSearchTerm}
              onChange={(e) => setSorcererSearchTerm(e.target.value)}
              className="mb-2"
            />
            <Controller
              name="sorcererIds"
              control={control}
              render={({ field }) => (
                <MultiSelect
                  label=""
                  options={sorcererOptions}
                  value={field.value ?? []}
                  onChange={field.onChange}
                  disabled={sorcerersQ.isLoading || !!sorcerersQ.isError}
                  placeholder={sorcerersQ.isLoading ? t('ui.loading') : (sorcerersQ.isError ? t('errors.loadSorcerers') : t('ui.selectPlaceholder'))}
                />
              )}
            />
            {errors.sorcererIds && <p className="text-xs text-red-400">{errors.sorcererIds.message}</p>}
          </div>

          {/* Fecha Fin - EDITABLE only when in Finished states */}
          {isFinishedInModal && (
            <div>
              <label className="block text-sm font-medium mb-1">{t('form.labels.endDate')}</label>
              <Input 
                type="datetime-local" 
                {...register('endAt')} 
              />
              {errors.endAt && <p className="text-xs text-red-400">{errors.endAt.message}</p>}
            </div>
          )}

          {/* Events - EDITABLE only when in Finished states */}
          {isFinishedInModal && (
            <div>
              <label className="block text-sm font-medium mb-1">{t('form.mission.events')}</label>
              <Input placeholder={t('form.mission.events')} {...register('events')} />
              {errors.events && <p className="text-xs text-red-400">{errors.events.message}</p>}
            </div>
          )}

          {/* Collateral Damage - EDITABLE only when in Finished states */}
          {isFinishedInModal && (
            <div>
              <label className="block text-sm font-medium mb-1">{t('form.mission.collateralDamage')}</label>
              <Input placeholder={t('form.mission.collateralDamage')} {...register('collateralDamage')} />
              {errors.collateralDamage && <p className="text-xs text-red-400">{errors.collateralDamage.message}</p>}
            </div>
          )}

          {/* Associated curses removed - handled via Malición asociada display above */}
        </form>
      </Modal>

      <ConfirmDialog
        open={deleteId !== null && canMutate}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        title={t('pages.missions.deleteTitle')}
        description={t('pages.missions.cannotUndo')}
        confirmText={t('ui.delete')}
      />
    </div>
  );
};
