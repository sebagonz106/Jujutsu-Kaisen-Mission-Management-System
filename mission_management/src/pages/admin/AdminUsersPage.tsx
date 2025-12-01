import React, { useEffect, useMemo, useState } from 'react';
import { userApi, type UsuarioDto, type CreateUsuarioRequest, type UpdateUsuarioRequest } from '../../api/userApi';
import { useAuth } from '../../hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Table, THead, TBody, TH, TD, SortHeader } from '../../components/ui/Table';
import { RoleBadge } from '../../components/ui/RoleBadge';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { toast } from 'sonner';
import { t } from '../../i18n';

const ROLES = ['support', 'sorcerer', 'admin'] as const;
type RoleType = (typeof ROLES)[number];

const ROLE_LABELS: Record<RoleType, string> = {
  support: 'Soporte',
  sorcerer: 'Hechicero',
  admin: 'Administrador',
};

export const AdminUsersPage: React.FC = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<UsuarioDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  
  // Sort state
  const [sortKey, setSortKey] = useState<keyof UsuarioDto>('id');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editUser, setEditUser] = useState<UsuarioDto | null>(null);
  const [deleteUserId, setDeleteUserId] = useState<number | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await userApi.list();
      setItems(data);
    } catch {
      setError('No se pudo cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let result = items;
    if (q) {
      result = items.filter(u =>
        u.nombre.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.rol || '').toLowerCase().includes(q),
      );
    }
    // Sort
    return [...result].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (typeof av === 'number' && typeof bv === 'number') {
        return sortDir === 'asc' ? av - bv : bv - av;
      }
      return sortDir === 'asc'
        ? String(av ?? '').localeCompare(String(bv ?? ''))
        : String(bv ?? '').localeCompare(String(av ?? ''));
    });
  }, [items, query, sortKey, sortDir]);

  const toggleSort = (key: keyof UsuarioDto) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  // const handleRoleChange = async (userId: number, newRole: string) => {
  //   try {
  //     await userApi.setRole(userId, newRole);
  //     setItems(prev => prev.map(x => x.id === userId ? { ...x, rol: newRole } : x));
  //     toast.success('Rol actualizado');
  //   } catch {
  //     toast.error('No se pudo cambiar el rol');
  //   }
  // };

  const handleDelete = async () => {
    if (!deleteUserId) return;
    try {
      await userApi.remove(deleteUserId);
      setItems(prev => prev.filter(x => x.id !== deleteUserId));
      toast.success('Usuario eliminado');
    } catch {
      toast.error('No se pudo eliminar');
    }
    setDeleteUserId(null);
  };

  const handleCreate = async (data: CreateUsuarioRequest) => {
    const created = await userApi.create(data);
    setItems(prev => [created, ...prev]);
    toast.success('Usuario creado');
  };

  const handleUpdate = async (id: number, data: UpdateUsuarioRequest) => {
    const updated = await userApi.update(id, data);
    setItems(prev => prev.map(x => x.id === id ? updated : x));
    toast.success('Usuario actualizado');
  };

  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/403" replace />;

  if (loading) {
    return (
      <div className="p-4 space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <h1 className="page-title">Gestión de Usuarios</h1>
        <div className="card-surface p-6 text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <Button onClick={fetchUsers}>{t('errors.tryAgain')}</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="page-title">Gestión de Usuarios</h1>
        <Button onClick={() => setShowCreateModal(true)}>{t('ui.new_masc')} Usuario</Button>
      </div>

      {/* Search */}
      <div className="card-surface p-4">
        <Input
          placeholder="Buscar por nombre, email, rol..."
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
      </div>

      {/* Table or Empty State */}
      {filtered.length === 0 ? (
        <EmptyState
          title="No hay usuarios"
          description="Crea el primer usuario para comenzar"
          action={<Button onClick={() => setShowCreateModal(true)}>Crear usuario</Button>}
        />
      ) : (
        <div className="card-surface p-4 overflow-x-auto">
          <Table>
            <THead>
              <tr>
                <TH><SortHeader label="ID" active={sortKey === 'id'} direction={sortDir} onClick={() => toggleSort('id')} /></TH>
                <TH><SortHeader label="Nombre" active={sortKey === 'nombre'} direction={sortDir} onClick={() => toggleSort('nombre')} /></TH>
                <TH><SortHeader label="Email" active={sortKey === 'email'} direction={sortDir} onClick={() => toggleSort('email')} /></TH>
                <TH><SortHeader label="Rol" active={sortKey === 'rol'} direction={sortDir} onClick={() => toggleSort('rol')} /></TH>
                <TH>Rango</TH>
                <TH><SortHeader label="Creado" active={sortKey === 'creadoEn'} direction={sortDir} onClick={() => toggleSort('creadoEn')} /></TH>
                <TH>{t('ui.actions')}</TH>
              </tr>
            </THead>
            <TBody>
              {filtered.map(u => (
                <tr key={u.id} className="border-b hover:bg-slate-800/40">
                  <TD>{u.id}</TD>
                  <TD>{u.nombre}</TD>
                  <TD>{u.email}</TD>
                  <TD>
                    {ROLES.includes(u.rol as RoleType) ? (
                      <RoleBadge role={u.rol as RoleType} />
                    ) : (
                      <span className="text-slate-400">{u.rol}</span>
                    )}
                  </TD>
                  <TD>{u.rango ?? '-'}</TD>
                  <TD>{new Date(u.creadoEn).toLocaleDateString()}</TD>
                  <TD>
                    <div className="flex gap-2">
                      <Button size="sm" variant="secondary" onClick={() => setEditUser(u)}>
                        {t('ui.edit')}
                      </Button>
                      <Button size="sm" variant="danger" onClick={() => setDeleteUserId(u.id)}>
                        {t('ui.delete')}
                      </Button>
                    </div>
                  </TD>
                </tr>
              ))}
            </TBody>
          </Table>
        </div>
      )}

      {/* Create Modal */}
      <UserFormModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmitCreate={handleCreate}
        title="Nuevo Usuario"
      />

      {/* Edit Modal */}
      <UserFormModal
        open={!!editUser}
        onClose={() => setEditUser(null)}
        onSubmitUpdate={(data) => handleUpdate(editUser!.id, data)}
        title="Editar Usuario"
        initialData={editUser ?? undefined}
        isEdit
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteUserId !== null}
        onClose={() => setDeleteUserId(null)}
        onConfirm={handleDelete}
        title="Eliminar usuario"
        description="¿Estás seguro de que deseas eliminar este usuario? Esta acción no se puede deshacer."
        confirmText={t('ui.delete')}
      />
    </div>
  );
};

interface UserFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmitCreate?: (data: CreateUsuarioRequest) => Promise<void>;
  onSubmitUpdate?: (data: UpdateUsuarioRequest) => Promise<void>;
  title: string;
  initialData?: UsuarioDto;
  isEdit?: boolean;
}

const UserFormModal: React.FC<UserFormModalProps> = ({
  open,
  onClose,
  onSubmitCreate,
  onSubmitUpdate,
  title,
  initialData,
  isEdit = false,
}) => {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rol, setRol] = useState<RoleType>('support');
  const [rango, setRango] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      setNombre(initialData?.nombre ?? '');
      setEmail(initialData?.email ?? '');
      setPassword('');
      setRol((initialData?.rol as RoleType) ?? 'support');
      setRango(initialData?.rango ?? '');
      setError(null);
    }
  }, [open, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      if (isEdit && onSubmitUpdate) {
        await onSubmitUpdate({
          nombre,
          email,
          ...(password ? { password } : {}),
          rol,
          rango: rango || null,
        });
      } else if (!isEdit && onSubmitCreate) {
        await onSubmitCreate({ nombre, email, password, rol, rango: rango || null });
      }
      onClose();
    } catch {
      setError(isEdit ? 'No se pudo actualizar el usuario' : 'No se pudo crear el usuario');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>{t('ui.cancel')}</Button>
          <Button type="submit" form="user-form" disabled={saving}>
            {isEdit ? t('ui.saveChanges') : t('ui.create')}
          </Button>
        </div>
      }
    >
      <form id="user-form" onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="text-sm text-red-400">{error}</p>}
        
        <Input
          label={t('form.labels.name')}
          placeholder="Nombre del usuario"
          value={nombre}
          onChange={e => setNombre(e.target.value)}
          required
        />
        
        <Input
          label={t('form.labels.email')}
          type="email"
          placeholder={t('form.placeholders.email')}
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        
        <Input
          label={isEdit ? 'Nueva contraseña (dejar en blanco para no cambiar)' : t('form.labels.password')}
          type="password"
          placeholder={t('form.placeholders.passwordDots')}
          value={password}
          onChange={e => setPassword(e.target.value)}
          required={!isEdit}
        />
        
        <Select
          label="Rol"
          value={rol}
          onChange={e => setRol(e.target.value as RoleType)}
        >
          {ROLES.map(r => (
            <option key={r} value={r}>{ROLE_LABELS[r]}</option>
          ))}
        </Select>
        
        <Input
          label="Rango (opcional)"
          placeholder="Ej: alto, especial..."
          value={rango}
          onChange={e => setRango(e.target.value)}
        />
      </form>
    </Modal>
  );
};

export default AdminUsersPage;
