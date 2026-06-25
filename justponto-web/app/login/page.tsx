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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro('');
    setLoading(true);
    try {
      await signIn(email, senha);
      const u = JSON.parse(localStorage.getItem('justponto_usuario') || '{}');
      router.replace(`/dashboard/${u.perfil}`);
    } catch {
      setErro('E-mail ou senha inválidos. Verifique os dados e tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  function preencher(e: string, s: string) {
    setEmail(e); setSenha(s);
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          <div className="login-logo-text">JustPonto</div>
          <div className="login-logo-sub">Controle de Justificativas de Ponto</div>
        </div>

        {erro && <div className="alert alert-error mb-4">{erro}</div>}

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">E-mail</label>
            <input
              id="email"
              type="email"
              className="form-control"
              placeholder="seu@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="senha">Senha</label>
            <input
              id="senha"
              type="password"
              className="form-control"
              placeholder="••••••••"
              value={senha}
              onChange={e => setSenha(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? <><span className="spinner" />Entrando...</> : 'Entrar'}
          </button>
        </form>

        <div className="login-hint">
          <strong>Contas de teste</strong> (senha: senha123)<br />
          <span style={{ cursor: 'pointer', color: 'var(--blue-600)' }} onClick={() => preencher('colaborador@empresa.com', 'senha123')}>colaborador</span>
          {' · '}
          <span style={{ cursor: 'pointer', color: 'var(--blue-600)' }} onClick={() => preencher('gerente@empresa.com', 'senha123')}>gerente</span>
          {' · '}
          <span style={{ cursor: 'pointer', color: 'var(--blue-600)' }} onClick={() => preencher('rh@empresa.com', 'senha123')}>rh</span>
          {' · '}
          <span style={{ cursor: 'pointer', color: 'var(--blue-600)' }} onClick={() => preencher('direcao@empresa.com', 'senha123')}>direção</span>
        </div>
      </div>
    </div>
  );
}
