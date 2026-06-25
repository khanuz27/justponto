'use client';
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth';

const NAV: Record<string, Array<{ label: string; icon: string; path: string }>> = {
  colaborador: [
    { label: 'Minhas Justificativas', icon: '📋', path: '/dashboard/colaborador' },
  ],
  gerente: [
    { label: 'Pendentes da Equipe', icon: '⏳', path: '/dashboard/gerente' },
  ],
  rh: [
    { label: 'Todas as Justificativas', icon: '📁', path: '/dashboard/rh' },
  ],
  direcao: [
    { label: 'Painel Geral', icon: '📊', path: '/dashboard/direcao' },
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
  const initials = usuario.nome.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();

  function handleLogout() {
    signOut();
    router.replace('/login');
  }

  return (
    <div className="app-shell">
      {/* ── Sidebar ── */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="sidebar-logo-text">⏱ JustPonto</div>
          <div className="sidebar-logo-sub">Controle de Ponto</div>
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-label">Menu</div>
          {navItems.map(item => (
            <a
              key={item.path}
              href={item.path}
              className={`sidebar-item${pathname === item.path ? ' active' : ''}`}
            >
              <span className="icon">{item.icon}</span>
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
            <button className="btn-logout" onClick={handleLogout} title="Sair">⎋</button>
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="main-content">{children}</main>
    </div>
  );
}
