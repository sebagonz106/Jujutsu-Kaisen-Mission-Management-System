/**
 * @fileoverview Home page with role-based dashboard.
 *
 * Displays a personalized dashboard with action cards based on user permissions.
 * Cards navigate to entities management, queries, and audit pages.
 *
 * @module pages/home/HomePage
 */

import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { canMutate as canMutateByRole } from '../../utils/permissions';
import { t } from '../../i18n';

/**
 * Maps user role enum to Spanish display label.
 */
const roleLabel = (role: 'sorcerer' | 'support' | 'admin'): string => {
  switch (role) {
    case 'admin':
      return 'Administrador';
    case 'support':
      return 'Personal de Apoyo';
    case 'sorcerer':
      return 'Hechicero';
  }
};

/**
 * HomePage component.
 *
 * Features:
 * - Personalized welcome message with user name and role
 * - Large card-based navigation (dashboard style)
 * - Conditional cards based on user permissions:
 *   - Entities Management: All users
 *   - Queries: All users
 *   - Recent Actions: Only users with mutation permissions
 * - Responsive grid layout
 */
export const HomePage = () => {
  const { user } = useAuth();
  const canMutate = canMutateByRole(user);

  return (
    <div className="page-container">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-100 mb-2">
          {t('pages.home.welcome')}, {user?.name ?? user?.email ?? t('nav.userFallback')}
        </h1>
        <p className="text-slate-400">
          {t('pages.home.myRole')}: <span className="text-slate-200 font-medium">{roleLabel(user?.role ?? 'support')}</span>
        </p>
      </div>

      <h2 className="text-xl font-semibold text-slate-200 mb-4">{t('pages.home.actions')}</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Entities Management Card */}
        <Link
          to="/entities"
          className="min-h-48 p-6 border-2 border-slate-700 hover:border-slate-500 rounded-lg bg-slate-800/40 hover:bg-slate-800/60 transition-all flex flex-col"
        >
          <div className="text-6xl mb-4 text-center">📋</div>
          <h3 className="text-2xl font-semibold text-slate-100 mb-2">{t('pages.home.cards.entities.title')}</h3>
          <p className="text-slate-400 text-sm mb-6 flex-1">{t('pages.home.cards.entities.desc')}</p>
          <div className="w-full py-2 px-4 bg-jjk-purple hover:bg-jjk-purple/80 rounded text-center text-slate-100 font-medium">
            Ver Entidades
          </div>
        </Link>

        {/* Queries Card */}
        <Link
          to="/queries"
          className="min-h-48 p-6 border-2 border-slate-700 hover:border-slate-500 rounded-lg bg-slate-800/40 hover:bg-slate-800/60 transition-all flex flex-col"
        >
          <div className="text-6xl mb-4 text-center">🔍</div>
          <h3 className="text-2xl font-semibold text-slate-100 mb-2">{t('pages.home.cards.queries.title')}</h3>
          <p className="text-slate-400 text-sm mb-6 flex-1">{t('pages.home.cards.queries.desc')}</p>
          <div className="w-full py-2 px-4 bg-jjk-purple hover:bg-jjk-purple/80 rounded text-center text-slate-100 font-medium">
            Ver Consultas
          </div>
        </Link>

        {/* Recent Actions Card - Only for users with mutation permissions */}
        {canMutate && (
          <Link
            to="/entities/recent-actions"
            className="min-h-48 p-6 border-2 border-slate-700 hover:border-slate-500 rounded-lg bg-slate-800/40 hover:bg-slate-800/60 transition-all flex flex-col"
          >
            <div className="text-6xl mb-4 text-center">📊</div>
            <h3 className="text-2xl font-semibold text-slate-100 mb-2">{t('pages.home.cards.recentActions.title')}</h3>
            <p className="text-slate-400 text-sm mb-6 flex-1">{t('pages.home.cards.recentActions.desc')}</p>
            <div className="w-full py-2 px-4 bg-jjk-purple hover:bg-jjk-purple/80 rounded text-center text-slate-100 font-medium">
              Ver Historial
            </div>
          </Link>
        )}
      </div>
    </div>
  );
};
