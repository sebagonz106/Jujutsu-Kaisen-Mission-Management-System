import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import RoleBadge from './ui/RoleBadge';

type LayoutProps = { children: React.ReactNode };

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const doLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="app-shell">
      <aside className="app-shell__sidebar">
        <h1 className="text-jjk-gold flex flex-col items-center gap-1 py-2">
          <span className="font-[Cinzel] tracking-wide text-lg">Jujutsu Kaisen</span>
          <span className="jp-mark text-xl text-jjk-purple">呪術廻戦</span>
        </h1>
        <nav className="flex flex-col gap-1">
          <NavLink to="/entities" className={({ isActive }) => `nav-link ${isActive ? 'nav-link--active' : ''}`}>Panel</NavLink>
          <NavLink to="/sorcerers" className={({ isActive }) => `nav-link ${isActive ? 'nav-link--active' : ''}`}>Hechiceros</NavLink>
          <NavLink to="/curses" className={({ isActive }) => `nav-link ${isActive ? 'nav-link--active' : ''}`}>Maldiciones</NavLink>
          <NavLink to="/missions" className={({ isActive }) => `nav-link ${isActive ? 'nav-link--active' : ''}`}>Misiones</NavLink>
        </nav>
        <div className="mt-auto flex flex-col gap-2">
          {user && (
            <div className="text-xs text-slate-400 flex flex-col gap-1">
              <span className="text-slate-200">{user.name ?? 'Usuario'}</span>
              <RoleBadge role={user.role} />
            </div>
          )}
          <button onClick={doLogout} className="nav-link bg-slate-800/40 hover:bg-red-900/30 hover:text-red-300">Cerrar sesión</button>
        </div>
      </aside>
      <main className="app-shell__content">
        {children}
      </main>
    </div>
  );
};

export default Layout;
