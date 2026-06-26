'use client';
import { useEffect, useState } from 'react';
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
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && !usuario) router.replace('/login');
  }, [usuario, loading, router]);

  // Close sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

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
      {/* Mobile hamburger */}
      <button className="mobile-menu-btn" onClick={() => setSidebarOpen(true)} aria-label="Abrir menu">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      {/* Overlay */}
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

      <aside className={`sidebar${sidebarOpen ? ' sidebar-open' : ''}`}>
        <div className="sidebar-logo">
          <img src="/logo-f2j.png" alt="F2J Solucoes" />
          <button className="sidebar-close-btn" onClick={() => setSidebarOpen(false)} aria-label="Fechar menu">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
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
