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
import { t } from '../../i18n';

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

  return (
    <div className="space-y-4 relative">
      {/* Logo superior derecha */}
      <div className="absolute top-0 right-0">
        <img src="/logo.svg" alt="Jujutsu Kaisen Mission Management" className="h-14 w-auto" />
      </div>

      <h1 className="page-title">
        {t('pages.home.welcome')}, {user?.name ?? user?.email ?? t('nav.userFallback')}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Entities Management Card */}
        <Link to="/entities" className="card-surface p-6 hover:border-slate-500 transition-all flex flex-col min-h-48">
          <div className="text-5xl mb-3 text-slate-400">📋</div>
          <h3 className="text-xl font-semibold text-slate-100 mb-2">{t('pages.home.cards.entities.title')}</h3>
          <p className="text-slate-400 text-sm flex-1">{t('pages.home.cards.entities.desc')}</p>
        </Link>

        {/* Queries Card */}
        <Link to="/queries" className="card-surface p-6 hover:border-slate-500 transition-all flex flex-col min-h-48">
          <div className="text-5xl mb-3 text-slate-400">🔍</div>
          <h3 className="text-xl font-semibold text-slate-100 mb-2">{t('pages.home.cards.queries.title')}</h3>
          <p className="text-slate-400 text-sm flex-1">{t('pages.home.cards.queries.desc')}</p>
        </Link>
      </div>
    </div>
  );
};
