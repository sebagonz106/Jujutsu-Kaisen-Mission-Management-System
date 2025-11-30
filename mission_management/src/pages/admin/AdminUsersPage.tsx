import React, { useEffect, useMemo, useState } from 'react';
import { userApi, type UsuarioDto } from '../../api/userApi';
import { useAuth } from '../../hooks/useAuth';
import { Navigate } from 'react-router-dom';

const roles = ['observer', 'support', 'sorcerer', 'admin'] as const;

export const AdminUsersPage: React.FC = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<UsuarioDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await userApi.list();
        setItems(data);
      } catch (e) {
        setError('No se pudo cargar usuarios');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(u =>
      u.nombre.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.rol || '').toLowerCase().includes(q),
    );
  }, [items, query]);

  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/403" replace />;

  return (
    <div className="space-y-4 fade-in">
      <div className="flex items-center justify-between">
        <h2 className="page-title">Gestión de Usuarios</h2>
        <a href="#create" className="btn-primary">Crear Usuario</a>
      </div>

      <div className="card-surface p-4">
        <input
          className="input w-full"
          placeholder="Buscar por nombre, email, rol..."
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
      </div>

      <div className="card-surface p-0 overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Email</th>
              <th>Rol</th>
              <th>Rango</th>
              <th>Creado</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={7} className="p-4">Cargando...</td></tr>
            )}
            {error && (
              <tr><td colSpan={7} className="p-4 text-red-600">{error}</td></tr>
            )}
            {!loading && !error && filtered.map(u => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td>{u.nombre}</td>
                <td>{u.email}</td>
                <td>
                  <select
                    className="input"
                    value={u.rol}
                    onChange={async (e) => {
                      const newRole = e.target.value;
                      try {
                        await userApi.setRole(u.id, newRole);
                        setItems(prev => prev.map(x => x.id === u.id ? { ...x, rol: newRole } : x));
                      } catch {
                        setError('No se pudo cambiar el rol');
                      }
                    }}
                  >
                    {roles.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </td>
                <td>{u.rango ?? '-'}</td>
                <td>{new Date(u.creadoEn).toLocaleString()}</td>
                <td>
                  <div className="flex gap-2">
                    <button className="btn" onClick={async () => {
                      const nombre = prompt('Nuevo nombre', u.nombre) ?? u.nombre;
                      const email = prompt('Nuevo email', u.email) ?? u.email;
                      try {
                        const updated = await userApi.update(u.id, { nombre, email });
                        setItems(prev => prev.map(x => x.id === u.id ? updated : x));
                      } catch {
                        setError('No se pudo actualizar');
                      }
                    }}>Editar</button>
                    <button className="btn-danger" onClick={async () => {
                      if (!confirm('Eliminar usuario?')) return;
                      try {
                        await userApi.remove(u.id);
                        setItems(prev => prev.filter(x => x.id !== u.id));
                      } catch {
                        setError('No se pudo eliminar');
                      }
                    }}>Eliminar</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <CreateUserPanel onCreated={u => setItems(prev => [u, ...prev])} />
    </div>
  );
};

const CreateUserPanel: React.FC<{ onCreated: (u: UsuarioDto) => void }> = ({ onCreated }) => {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rol, setRol] = useState<'observer' | 'support' | 'sorcerer' | 'admin'>('observer');
  const [rango, setRango] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div id="create" className="card-surface p-4 space-y-3">
      <h3 className="section-title">Crear Usuario</h3>
      {error && <div className="text-red-600">{error}</div>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <input className="input" placeholder="Nombre" value={nombre} onChange={e => setNombre(e.target.value)} />
        <input className="input" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
        <input className="input" placeholder="Contraseña" type="password" value={password} onChange={e => setPassword(e.target.value)} />
        <select className="input" value={rol} onChange={e => setRol(e.target.value as any)}>
          {roles.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
        <input className="input" placeholder="Rango (opcional)" value={rango} onChange={e => setRango(e.target.value)} />
      </div>
      <div>
        <button
          className="btn-primary"
          disabled={saving}
          onClick={async () => {
            setSaving(true);
            setError(null);
            try {
              const created = await userApi.create({ nombre, email, password, rol, rango: rango || null });
              onCreated(created);
              setNombre(''); setEmail(''); setPassword(''); setRango(''); setRol('observer');
            } catch {
              setError('No se pudo crear el usuario');
            } finally {
              setSaving(false);
            }
          }}
        >
          Crear
        </button>
      </div>
    </div>
  );
};

export default AdminUsersPage;
