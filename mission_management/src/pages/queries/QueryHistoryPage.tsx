/**
 * @fileoverview Query history page (placeholder).
 *
 * Displays a placeholder for future query history functionality.
 * Only accessible to users with mutation permissions (admin, support, high-rank sorcerers).
 *
 * @module pages/queries/QueryHistoryPage
 */

import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { canMutate as canMutateByRole } from '../../utils/permissions';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { t } from '../../i18n';

/**
 * QueryHistoryPage component.
 *
 * Features:
 * - Placeholder for future query history tracking
 * - Permission guard redirects unauthorized users
 * - Export PDF button (disabled, coming soon)
 */
export const QueryHistoryPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const canMutate = canMutateByRole(user);

  // Redirect if user doesn't have permissions
  if (!canMutate) {
    navigate('/', { replace: true });
    return null;
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('pages.queryHistory.title')}</h1>
          <p className="text-slate-400 text-sm mt-1">{t('pages.queryHistory.desc')}</p>
        </div>
        <Button
          variant="outline"
          disabled
          title={t('pages.recentActions.comingSoon')}
        >
          {t('pages.recentActions.exportPdf')}
        </Button>
      </div>

      <EmptyState
        title={t('pages.queryHistory.emptyTitle')}
        description={t('pages.queryHistory.emptyDesc')}
      />
    </div>
  );
};
