import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../hooks/useAuth';
import { authApi } from '../api/authApi';
import { toast } from 'sonner';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';

const schema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
});
type FormValues = z.infer<typeof schema>;

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const fromPath = (location.state as { from?: Location } | null)?.from?.pathname;
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = handleSubmit(async (values) => {
    try {
      const { accessToken, user } = await authApi.login(values);
      login(accessToken, user);
      toast.success('Bienvenido');
      // Decide adónde redirigir: prioridad al "from", si existe y no es /login
      // Simplified redirect: if user was heading somewhere, go there; else send to entities index
      const target = fromPath && fromPath !== '/login' ? fromPath : '/entities';
      navigate(target, { replace: true });
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (err.response) {
          if (err.response.status === 401) {
            toast.error('Credenciales inválidas');
          } else {
            const data: unknown = err.response.data;
            const message = typeof data === 'object' && data && 'message' in (data as Record<string, unknown>)
              ? String((data as Record<string, unknown>).message)
              : 'Intenta de nuevo';
            toast.error(`Error ${err.response.status}: ${message}`);
          }
        } else {
          toast.error('Error de red. ¿Mock activo? Revisa VITE_USE_MOCK.');
        }
      } else {
        toast.error('Error inesperado');
      }
  // Opcional: log para depuración
  console.debug('[Login error]', err);
    }
  });

  return (
    <div className="max-w-sm mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Login</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm mb-1">Email</label>
          <input
            type="email"
            className="w-full border rounded px-3 py-2 text-black"
            {...register('email')}
            required
          />
          {errors.email && <p className="text-red-400 text-sm">{errors.email.message}</p>}
        </div>
        <div>
          <label className="block text-sm mb-1">Password</label>
          <input
            type="password"
            className="w-full border rounded px-3 py-2 text-black"
            {...register('password')}
            required
          />
          {errors.password && <p className="text-red-400 text-sm">{errors.password.message}</p>}
        </div>
        <button
          disabled={isSubmitting}
          className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-4 py-2 rounded w-full"
        >
          {isSubmitting ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
    </div>
  );
};
