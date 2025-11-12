import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { authApi } from '../api/authApi';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'sonner';
import axios from 'axios';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { t } from '../i18n';

const schema = z.object({
  name: z.string().min(2, t('form.validation.nameTooShort')),
  email: z.string().email(t('form.validation.emailInvalid')),
  password: z.string().min(6, t('form.validation.passwordMin6')),
  confirm: z.string().min(6),
}).refine((data) => data.password === data.confirm, {
  path: ['confirm'],
  message: t('form.validation.passwordMismatch'),
});

type FormValues = z.infer<typeof schema>;

export const RegisterPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const fromPath = (location.state as { from?: Location } | null)?.from?.pathname;
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = handleSubmit(async (values) => {
    try {
      const { accessToken, user } = await authApi.register({
        name: values.name,
        email: values.email,
        password: values.password,
      });
      login(accessToken, user);
      toast.success(t('auth.registered'));
      const target = fromPath && fromPath !== '/login' ? fromPath : '/entities';
      navigate(target, { replace: true });
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (err.response) {
          const data: unknown = err.response.data;
          const message = typeof data === 'object' && data && 'message' in (data as Record<string, unknown>)
            ? String((data as Record<string, unknown>).message)
            : t('errors.tryAgain');
          toast.error(`Error ${err.response.status}: ${message}`);
        } else {
          toast.error(t('errors.network'));
        }
      } else {
        toast.error(t('errors.unexpected'));
      }
      console.debug('[Register error]', err);
    }
  });

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-lg bg-jjk-dark border border-jjk-ash rounded-xl shadow-mystical p-8 space-y-6 fade-in">
        <div className="text-center space-y-2">
          <h1 className="font-[Cinzel] text-3xl text-jjk-gold tracking-wide">{t('pages.register.title')}</h1>
          <p className="jp-mark text-jjk-purple text-lg">呪術廻戦</p>
          <p className="text-xs text-jjk-fog">{t('pages.register.subtitleObserver')}</p>
        </div>
        <form onSubmit={onSubmit} className="space-y-5">
          <div className="space-y-1">
            <label className="block text-sm text-jjk-fog">{t('form.labels.name')}</label>
            <input
              type="text"
              className="w-full rounded-md bg-jjk-ash/40 border border-jjk-ash focus:border-jjk-purple focus:outline-none px-3 py-2 text-white placeholder:text-slate-400"
              placeholder={t('form.placeholders.name')}
              {...register('name')}
              required
            />
            {errors.name && <p className="text-red-400 text-xs">{errors.name.message}</p>}
          </div>
          <div className="space-y-1">
            <label className="block text-sm text-jjk-fog">{t('form.labels.email')}</label>
            <input
              type="email"
              className="w-full rounded-md bg-jjk-ash/40 border border-jjk-ash focus:border-jjk-purple focus:outline-none px-3 py-2 text-white placeholder:text-slate-400"
              placeholder={t('form.placeholders.email')}
              {...register('email')}
              required
            />
            {errors.email && <p className="text-red-400 text-xs">{errors.email.message}</p>}
          </div>
          <div className="space-y-1">
            <label className="block text-sm text-jjk-fog">{t('form.labels.password')}</label>
            <input
              type="password"
              className="w-full rounded-md bg-jjk-ash/40 border border-jjk-ash focus:border-jjk-purple focus:outline-none px-3 py-2 text-white placeholder:text-slate-400"
              placeholder={t('form.placeholders.passwordDots')}
              {...register('password')}
              required
            />
            {errors.password && <p className="text-red-400 text-xs">{errors.password.message}</p>}
          </div>
          <div className="space-y-1">
            <label className="block text-sm text-jjk-fog">{t('form.labels.confirm')}</label>
            <input
              type="password"
              className="w-full rounded-md bg-jjk-ash/40 border border-jjk-ash focus:border-jjk-purple focus:outline-none px-3 py-2 text-white placeholder:text-slate-400"
              placeholder={t('form.placeholders.confirmPassword')}
              {...register('confirm')}
              required
            />
            {errors.confirm && <p className="text-red-400 text-xs">{errors.confirm.message}</p>}
          </div>
          <button
            disabled={isSubmitting}
            className="w-full rounded-md bg-jjk-indigo hover:bg-jjk-purple text-white font-semibold py-2 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? t('pages.register.buttonRegistering') : t('pages.register.buttonCreate')}
          </button>
        </form>
        <div className="text-center text-sm text-jjk-fog">
          {t('pages.register.linkHasAccount')} <Link to="/login" className="text-jjk-gold hover:underline">{t('pages.register.linkLogin')}</Link>
        </div>
      </div>
    </div>
  );
};