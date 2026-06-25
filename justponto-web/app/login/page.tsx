'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';

export default function LoginPage() {
  const { signIn } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro('');
    setLoading(true);
    try {
      await signIn(email, senha);
      const u = JSON.parse(localStorage.getItem('justponto_usuario') || '{}');
      router.replace(`/dashboard/${u.perfil}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '';
      if (!msg || msg.includes('fetch') || msg.includes('network') || msg.includes('Failed')) {
        setErro('Nao foi possivel conectar ao servidor. Verifique sua conexao e tente novamente.');
      } else if (msg.includes('desativada')) {
        setErro('Conta desativada. Entre em contato com o RH.');
      } else {
        setErro('E-mail ou senha invalidos. Verifique os dados e tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-split">
      {/* ── Painel esquerdo — marca ── */}
      <div className="login-brand">
        <div className="login-brand-bg">
          <div className="login-orb login-orb-1" />
          <div className="login-orb login-orb-2" />
          <div className="login-orb login-orb-3" />
        </div>
        <div className="login-brand-content">
          <img src="/logo-f2j.png" alt="F2J Solucoes" className="login-brand-logo" />
          <h2 className="login-brand-title">Controle de Justificativas de Ponto</h2>
          <p className="login-brand-desc">
            Gerencie justificativas, acompanhe pendencias e mantenha o controle total
            do registro de ponto da sua equipe.
          </p>
          <div className="login-brand-features">
            <div className="login-feature">
              <span className="login-feature-dot" />
              Registro e acompanhamento em tempo real
            </div>
            <div className="login-feature">
              <span className="login-feature-dot" />
              Aprovacao multinivel (Gerente, RH, Direcao)
            </div>
            <div className="login-feature">
              <span className="login-feature-dot" />
              Relatorios e indicadores consolidados
            </div>
          </div>
        </div>
        <div className="login-brand-footer">
          F2J Solucoes &copy; {new Date().getFullYear()}
        </div>
      </div>

      {/* ── Painel direito — formulário ── */}
      <div className="login-form-panel">
        <div className="login-form-container">
          <div className="login-form-header">
            <h1 className="login-form-title">Bem-vindo de volta</h1>
            <p className="login-form-subtitle">Insira suas credenciais para acessar o sistema</p>
          </div>

          {erro && (
            <div className="login-alert">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M8 4.5v4M8 10.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              {erro}
            </div>
          )}

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="login-field">
              <label className="login-label" htmlFor="email">E-mail</label>
              <div className="login-input-wrap">
                <svg className="login-input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="4" width="20" height="16" rx="3"/>
                  <path d="m2 7 10 6 10-6"/>
                </svg>
                <input
                  id="email"
                  type="email"
                  className="login-input"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="login-field">
              <label className="login-label" htmlFor="senha">Senha</label>
              <div className="login-input-wrap">
                <svg className="login-input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="3"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                <input
                  id="senha"
                  type={showPassword ? 'text' : 'password'}
                  className="login-input"
                  placeholder="Digite sua senha"
                  value={senha}
                  onChange={e => setSenha(e.target.value)}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="login-toggle-pw"
                  onClick={() => setShowPassword(v => !v)}
                  tabIndex={-1}
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button type="submit" className="login-submit" disabled={loading}>
              {loading ? (
                <><span className="spinner" /> Entrando...</>
              ) : (
                'Entrar'
              )}
            </button>
          </form>

          <div className="login-footer-text">
            Problemas para acessar? Fale com o setor de RH.
          </div>
        </div>
      </div>
    </div>
  );
}
