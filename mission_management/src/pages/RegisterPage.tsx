import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { authApi } from '../api/authApi';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'sonner';
import axios from 'axios';
import { useNavigate, useLocation, Link } from 'react-router-dom';

const schema = z.object({
  name: z.string().min(2, 'Nombre muy corto'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
  confirm: z.string().min(6),
}).refine((data) => data.password === data.confirm, {
  path: ['confirm'],
  message: 'Las contraseñas no coinciden',
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
      toast.success('Registrado');
      const target = fromPath && fromPath !== '/login' ? fromPath : '/entities';
      navigate(target, { replace: true });
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (err.response) {
          const data: unknown = err.response.data;
          const message = typeof data === 'object' && data && 'message' in (data as Record<string, unknown>)
            ? String((data as Record<string, unknown>).message)
            : 'Intenta de nuevo';
          toast.error(`Error ${err.response.status}: ${message}`);
        } else {
          toast.error('Error de red. ¿Mock activo?');
        }
      } else {
        toast.error('Error inesperado');
      }
      console.debug('[Register error]', err);
    }
  });

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-lg bg-jjk-dark border border-jjk-ash rounded-xl shadow-mystical p-8 space-y-6 fade-in">
        <div className="text-center space-y-2">
          <h1 className="font-[Cinzel] text-3xl text-jjk-gold tracking-wide">Registro</h1>
          <p className="jp-mark text-jjk-purple text-lg">呪術廻戦</p>
          <p className="text-xs text-jjk-fog">Crear cuenta observador</p>
        </div>
        <form onSubmit={onSubmit} className="space-y-5">
          <div className="space-y-1">
            <label className="block text-sm text-jjk-fog">Nombre</label>
            <input
              type="text"
              className="w-full rounded-md bg-jjk-ash/40 border border-jjk-ash focus:border-jjk-purple focus:outline-none px-3 py-2 text-white placeholder:text-slate-400"
              placeholder="Tu nombre"
              {...register('name')}
              required
            />
            {errors.name && <p className="text-red-400 text-xs">{errors.name.message}</p>}
          </div>
          <div className="space-y-1">
            <label className="block text-sm text-jjk-fog">Email</label>
            <input
              type="email"
              className="w-full rounded-md bg-jjk-ash/40 border border-jjk-ash focus:border-jjk-purple focus:outline-none px-3 py-2 text-white placeholder:text-slate-400"
              placeholder="tu@email.com"
              {...register('email')}
              required
            />
            {errors.email && <p className="text-red-400 text-xs">{errors.email.message}</p>}
          </div>
          <div className="space-y-1">
            <label className="block text-sm text-jjk-fog">Contraseña</label>
            <input
              type="password"
              className="w-full rounded-md bg-jjk-ash/40 border border-jjk-ash focus:border-jjk-purple focus:outline-none px-3 py-2 text-white placeholder:text-slate-400"
              placeholder="••••••"
              {...register('password')}
              required
            />
            {errors.password && <p className="text-red-400 text-xs">{errors.password.message}</p>}
          </div>
          <div className="space-y-1">
            <label className="block text-sm text-jjk-fog">Confirmar</label>
            <input
              type="password"
              className="w-full rounded-md bg-jjk-ash/40 border border-jjk-ash focus:border-jjk-purple focus:outline-none px-3 py-2 text-white placeholder:text-slate-400"
              placeholder="Repite contraseña"
              {...register('confirm')}
              required
            />
            {errors.confirm && <p className="text-red-400 text-xs">{errors.confirm.message}</p>}
          </div>
          <button
            disabled={isSubmitting}
            className="w-full rounded-md bg-jjk-indigo hover:bg-jjk-purple text-white font-semibold py-2 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'Registrando...' : 'Crear cuenta'}
          </button>
        </form>
        <div className="text-center text-sm text-jjk-fog">
          ¿Ya tienes cuenta? <Link to="/login" className="text-jjk-gold hover:underline">Inicia sesión</Link>
        </div>
      </div>
    </div>
  );
};