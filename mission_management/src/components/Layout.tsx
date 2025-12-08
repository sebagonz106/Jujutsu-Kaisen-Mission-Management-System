import { NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { canMutate as canMutateByRole } from '../utils/permissions';
import RoleBadge from './ui/RoleBadge';
import { t } from '../i18n';

type LayoutProps = { children: React.ReactNode };

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [entitiesOpen, setEntitiesOpen] = useState(false);
  const [queriesOpen, setQueriesOpen] = useState(false);
  const [auditOpen, setAuditOpen] = useState(false);
  
  const canMutate = canMutateByRole(user);

  const doLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="app-shell">
      <aside className={`app-shell__sidebar transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-16'}`}>
        <div className="flex items-center justify-between p-2">
          <h1 className={`text-jjk-gold flex flex-col items-center gap-1 transition-opacity ${isSidebarOpen ? 'opacity-100' : 'opacity-0'}`}>
            <span className="font-[Cinzel] tracking-wide text-lg">Jujutsu Kaisen</span>
            <span className="jp-mark text-xl text-jjk-purple">呪術廻戦</span>
          </h1>
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="text-slate-400 hover:text-slate-200 p-2"
            aria-label="Toggle sidebar"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
        
        <nav className="flex flex-col gap-1 overflow-y-auto flex-1 px-2">
          {/* Home */}
          <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'nav-link--active' : ''}`}>
            {isSidebarOpen ? t('nav.home') : '🏠'}
          </NavLink>
          
          {/* Entities Section */}
          <div>
            <button 
              onClick={() => setEntitiesOpen(!entitiesOpen)}
              className="nav-link w-full text-left flex items-center justify-between"
            >
              <span>{isSidebarOpen ? t('nav.entities') : '📋'}</span>
              {isSidebarOpen && (
                <svg className={`w-4 h-4 transition-transform ${entitiesOpen ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              )}
            </button>
            {isSidebarOpen && entitiesOpen && (
              <div className="ml-4 flex flex-col gap-1 mt-1">
                <NavLink to="/sorcerers" className={({ isActive }) => `nav-link text-sm ${isActive ? 'nav-link--active' : ''}`}>{t('nav.sorcerers')}</NavLink>
                <NavLink to="/curses" className={({ isActive }) => `nav-link text-sm ${isActive ? 'nav-link--active' : ''}`}>{t('nav.curses')}</NavLink>
                <NavLink to="/missions" className={({ isActive }) => `nav-link text-sm ${isActive ? 'nav-link--active' : ''}`}>{t('nav.missions')}</NavLink>
                <NavLink to="/locations" className={({ isActive }) => `nav-link text-sm ${isActive ? 'nav-link--active' : ''}`}>{t('nav.locations')}</NavLink>
                <NavLink to="/techniques" className={({ isActive }) => `nav-link text-sm ${isActive ? 'nav-link--active' : ''}`}>{t('nav.techniques')}</NavLink>
                <NavLink to="/resources" className={({ isActive }) => `nav-link text-sm ${isActive ? 'nav-link--active' : ''}`}>{t('nav.resources')}</NavLink>
                <NavLink to="/requests" className={({ isActive }) => `nav-link text-sm ${isActive ? 'nav-link--active' : ''}`}>{t('nav.requests')}</NavLink>
                <NavLink to="/support-staff" className={({ isActive }) => `nav-link text-sm ${isActive ? 'nav-link--active' : ''}`}>{t('nav.supportStaff')}</NavLink>
                <NavLink to="/transfers" className={({ isActive }) => `nav-link text-sm ${isActive ? 'nav-link--active' : ''}`}>{t('nav.transfers')}</NavLink>
                <NavLink to="/resource-usages" className={({ isActive }) => `nav-link text-sm ${isActive ? 'nav-link--active' : ''}`}>{t('nav.resourceUsages')}</NavLink>
                <NavLink to="/sorcerers-in-charge" className={({ isActive }) => `nav-link text-sm ${isActive ? 'nav-link--active' : ''}`}>{t('nav.sorcerersInCharge')}</NavLink>
                <NavLink to="/mastered-techniques" className={({ isActive }) => `nav-link text-sm ${isActive ? 'nav-link--active' : ''}`}>{t('nav.masteredTechniques')}</NavLink>
              </div>
            )}
          </div>

          {/* Queries Section */}
          <div>
            <button 
              onClick={() => setQueriesOpen(!queriesOpen)}
              className="nav-link w-full text-left flex items-center justify-between"
            >
              <span>{isSidebarOpen ? t('nav.queriesSection') : '🔍'}</span>
              {isSidebarOpen && (
                <svg className={`w-4 h-4 transition-transform ${queriesOpen ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              )}
            </button>
            {isSidebarOpen && queriesOpen && (
              <div className="ml-4 flex flex-col gap-1 mt-1">
                <NavLink to="/queries/curses-by-state" className={({ isActive }) => `nav-link text-sm ${isActive ? 'nav-link--active' : ''}`}>{t('pages.queries.rf12.title')}</NavLink>
              </div>
            )}
          </div>

          {/* Audit Section - Only for users with mutation permissions */}
          {canMutate && (
            <div>
              <button 
                onClick={() => setAuditOpen(!auditOpen)}
                className="nav-link w-full text-left flex items-center justify-between"
              >
                <span>{isSidebarOpen ? t('nav.auditSection') : '📊'}</span>
                {isSidebarOpen && (
                  <svg className={`w-4 h-4 transition-transform ${auditOpen ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                )}
              </button>
              {isSidebarOpen && auditOpen && (
                <div className="ml-4 flex flex-col gap-1 mt-1">
                  <NavLink to="/entities/recent-actions" className={({ isActive }) => `nav-link text-sm ${isActive ? 'nav-link--active' : ''}`}>{t('nav.recentActions')}</NavLink>
                  <NavLink to="/queries/history" className={({ isActive }) => `nav-link text-sm ${isActive ? 'nav-link--active' : ''}`}>{t('nav.queryHistory')}</NavLink>
                </div>
              )}
            </div>
          )}

          {/* Admin Section */}
          {user?.role === 'admin' && (
            <NavLink to="/admin/users" className={({ isActive }) => `nav-link ${isActive ? 'nav-link--active' : ''}`}>
              {isSidebarOpen ? 'Usuarios' : '👤'}
            </NavLink>
          )}
        </nav>
        
        <div className="mt-auto flex flex-col gap-2 p-2">
          {user && isSidebarOpen && (
            <div className="text-xs text-slate-400 flex flex-col gap-1">
              <span className="text-slate-200">{user.name ?? t('nav.userFallback')}</span>
              <RoleBadge role={user.role} />
            </div>
          )}
          <button onClick={doLogout} className="nav-link bg-slate-800/40 hover:bg-red-900/30 hover:text-red-300">
            {isSidebarOpen ? t('nav.logout') : '🚪'}
          </button>
        </div>
      </aside>
      <main className="app-shell__content">
        {children}
      </main>
    </div>
  );
};

export default Layout;
