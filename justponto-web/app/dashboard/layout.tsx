'use client';
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth';

const NAV: Record<string, Array<{ label: string; path: string }>> = {
  colaborador: [
    { label: 'Minhas Justificativas', path: '/dashboard/colaborador' },
  ],
  gerente: [
    { label: 'Pendentes da Equipe', path: '/dashboard/gerente' },
    { label: 'Funcionários', path: '/dashboard/funcionarios' },
  ],
  rh: [
    { label: 'Todas as Justificativas', path: '/dashboard/rh' },
    { label: 'Funcionários', path: '/dashboard/funcionarios' },
  ],
  direcao: [
    { label: 'Painel Geral', path: '/dashboard/direcao' },
    { label: 'Funcionários', path: '/dashboard/funcionarios' },
  ],
};

const LABELS: Record<string, string> = {
  colaborador: 'Colaborador',
  gerente: 'Gerente',
  rh: 'RH',
  direcao: 'Direção',
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { usuario, loading, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !usuario) router.replace('/login');
  }, [usuario, loading, router]);

  if (loading || !usuario) {
    return (
      <div className="loading-screen">
        <span className="spinner" style={{ color: 'var(--blue-600)' }} />
        Carregando...
      </div>
    );
  }

  const navItems = NAV[usuario.perfil] ?? [];
  const initials = usuario.nome.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase();

  function handleLogout() {
    signOut();
    router.replace('/login');
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <img src="/logo-f2j.png" alt="F2J Solucoes" />
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-label">Menu</div>
          {navItems.map(item => (
            <a
              key={item.path}
              href={item.path}
              className={`sidebar-item${pathname === item.path ? ' active' : ''}`}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-card">
            <div className="user-avatar">{initials}</div>
            <div className="user-info">
              <div className="user-name">{usuario.nome}</div>
              <div className="user-role">{LABELS[usuario.perfil]}</div>
            </div>
            <button className="btn-logout" onClick={handleLogout} title="Sair">Sair</button>
          </div>
        </div>
      </aside>

      <main className="main-content">{children}</main>
    </div>
  );
}
