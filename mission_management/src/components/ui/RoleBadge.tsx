type Role = 'sorcerer' | 'support' | 'admin';

type RoleBadgeProps = {
  role: Role;
  size?: 'sm' | 'md';
  className?: string;
};

const ROLE_STYLES: Record<Role, string> = {
  sorcerer: 'bg-jjk-purple text-white',
  support: 'bg-jjk-gold text-jjk-dark',
  admin: 'bg-red-600 text-white',
};

export const RoleBadge: React.FC<RoleBadgeProps> = ({ role, size = 'sm', className }) => {
  const base = 'inline-flex items-center rounded-full font-medium tracking-wide';
  const sizeCls = size === 'sm' ? 'text-xs px-2 py-[2px]' : 'text-sm px-2.5 py-1';
  const roleCls = ROLE_STYLES[role];
  const classes = [base, sizeCls, roleCls, className].filter(Boolean).join(' ');
  return (
    <span aria-label={`Rol: ${role}`} className={classes}>
      {role === 'sorcerer' && 'Hechicero'}
      {role === 'support' && 'Soporte'}
      {role === 'admin' && 'Administrador'}
    </span>
  );
};

export default RoleBadge;
