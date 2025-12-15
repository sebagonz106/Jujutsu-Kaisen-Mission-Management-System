/**
 * @fileoverview Queries index page with available queries grid.
 *
 * Displays a grid of available analytical queries with descriptions.
 * Currently shows RF-12 (Curses by State) and placeholders for future queries (RF-13 to RF-19).
 *
 * @module pages/queries/QueriesIndexPage
 */

import { Link } from 'react-router-dom';
import { t } from '../../i18n';

/**
 * QueriesIndexPage component.
 *
 * Features:
 * - Grid layout with query cards
 * - Active card for RF-12 (navigable)
 * - Placeholder cards for upcoming queries (RF-13 to RF-19)
 * - Responsive design
 */
export const QueriesIndexPage = () => {
  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">{t('pages.queries.title')}</h1>
        <p className="text-slate-400 text-sm">Consultas analíticas disponibles</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* RF-12: Curses by State - Active */}
        <Link
          to="/queries/curses-by-state"
          className="card-surface p-6 hover:border-slate-500 transition-all flex flex-col"
        >
          <div className="text-4xl mb-3">🔍</div>
          <h3 className="text-xl font-semibold text-slate-100 mb-2">{t('pages.queries.rf12.title')}</h3>
          <p className="text-slate-400 text-sm flex-1">{t('pages.queries.rf12.desc')}</p>
          <div className="mt-4 text-jjk-purple text-sm font-medium">RF-12 →</div>
        </Link>

        {/* RF-13: Missions in Date Range - Active */}
        <Link
          to="/queries/missions-in-range"
          className="card-surface p-6 hover:border-slate-500 transition-all flex flex-col"
        >
          <div className="text-4xl mb-3">📅</div>
          <h3 className="text-xl font-semibold text-slate-100 mb-2">{t('pages.queries.rf13.title')}</h3>
          <p className="text-slate-400 text-sm flex-1">{t('pages.queries.rf13.desc')}</p>
          <div className="mt-4 text-jjk-purple text-sm font-medium">RF-13 →</div>
        </Link>

        {/* RF-14: Sorcerer Statistics - Active */}
        <Link
          to="/queries/sorcerer-stats"
          className="card-surface p-6 hover:border-slate-500 transition-all flex flex-col"
        >
          <div className="text-4xl mb-3">📊</div>
          <h3 className="text-xl font-semibold text-slate-100 mb-2">{t('pages.queries.rf14.title')}</h3>
          <p className="text-slate-400 text-sm flex-1">{t('pages.queries.rf14.desc')}</p>
          <div className="mt-4 text-jjk-purple text-sm font-medium">RF-14 →</div>
        </Link>

        {/* Query2: Missions by Sorcerer - Active */}
        <Link
          to="/queries/sorcerer-missions"
          className="card-surface p-6 hover:border-slate-500 transition-all flex flex-col"
        >
          <div className="text-4xl mb-3">🎯</div>
          <h3 className="text-xl font-semibold text-slate-100 mb-2">{t('pages.queries.sorcererMissions.title')}</h3>
          <p className="text-slate-400 text-sm flex-1">{t('pages.queries.sorcererMissions.desc')}</p>
          <div className="mt-4 text-jjk-purple text-sm font-medium">RF-15 →</div>
        </Link>

        {/* Query4: Technique Effectiveness - Active */}
        <Link
          to="/queries/technique-effectiveness"
          className="card-surface p-6 hover:border-slate-500 transition-all flex flex-col"
        >
          <div className="text-4xl mb-3">⚡</div>
          <h3 className="text-xl font-semibold text-slate-100 mb-2">{t('pages.queries.techniqueEffectiveness.title')}</h3>
          <p className="text-slate-400 text-sm flex-1">{t('pages.queries.techniqueEffectiveness.desc')}</p>
          <div className="mt-4 text-jjk-purple text-sm font-medium">RF-16 →</div>
        </Link>

        {/* Query6: Master-Disciples - Active */}
        <Link
          to="/queries/master-disciples"
          className="card-surface p-6 hover:border-slate-500 transition-all flex flex-col"
        >
          <div className="text-4xl mb-3">👥</div>
          <h3 className="text-xl font-semibold text-slate-100 mb-2">{t('pages.queries.masterDisciples.title')}</h3>
          <p className="text-slate-400 text-sm flex-1">{t('pages.queries.masterDisciples.desc')}</p>
          <div className="mt-4 text-jjk-purple text-sm font-medium">RF-17 →</div>
        </Link>

        {/* Ranking: Sorcerer Ranking - Active */}
        <Link
          to="/queries/ranking"
          className="card-surface p-6 hover:border-slate-500 transition-all flex flex-col"
        >
          <div className="text-4xl mb-3">🏆</div>
          <h3 className="text-xl font-semibold text-slate-100 mb-2">{t('pages.queries.sorcererRanking.title')}</h3>
          <p className="text-slate-400 text-sm flex-1">{t('pages.queries.sorcererRanking.desc')}</p>
          <div className="mt-4 text-jjk-purple text-sm font-medium">RF-18 →</div>
        </Link>


      </div>
    </div>
  );
};
