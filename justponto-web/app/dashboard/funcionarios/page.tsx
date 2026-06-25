'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import {
  getUsuarios,
  getTodasJustificativas,
  criarUsuario,
  atualizarStatusUsuario,
  UsuarioCompleto,
  Justificativa,
} from '@/lib/api';

const PERFIL_LABEL: Record<string, string> = {
  colaborador: 'Colaborador',
  gerente: 'Gerente',
  rh: 'RH',
  direcao: 'Direção',
};

export default function FuncionariosPage() {
  const router = useRouter();
  const { usuario } = useAuth();

  const [usuarios, setUsuarios] = useState<UsuarioCompleto[]>([]);
  const [justificativas, setJustificativas] = useState<Justificativa[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');
  const [mostrarInativos, setMostrarInativos] = useState(false);
  const [alterandoId, setAlterandoId] = useState<string | null>(null);

  // Modal de cadastro
  const [showModal, setShowModal] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [perfil, setPerfil] = useState<'colaborador' | 'gerente' | 'rh' | 'direcao'>('colaborador');
  const [mostrarSenha, setMostrarSenha] = useState(false);

  const podeCadastrar = usuario?.perfil !== 'colaborador';

  const carregar = useCallback(async () => {
    setLoading(true);
    try {
      const u = await getUsuarios();
      setUsuarios(u);
    } catch { /* ignore */ }
    try {
      const j = await getTodasJustificativas();
      setJustificativas(j);
    } catch { /* sem acesso */ }
    setLoading(false);
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  function totalPor(userId: string) {
    const mine = justificativas.filter(j => j.colaboradorId === userId);
    return {
      total: mine.length,
      aprovadas: mine.filter(j => j.status === 'aprovada').length,
      pendentes: mine.filter(j => j.status === 'pendente').length,
      reprovadas: mine.filter(j => j.status === 'reprovada').length,
    };
  }

  async function handleToggleStatus(u: UsuarioCompleto) {
    // Impede desativar o próprio usuário logado
    if (u.id === usuario?.id) {
      setSucesso('');
      setErro('Você não pode desativar sua própria conta.');
      setTimeout(() => setErro(''), 4000);
      return;
    }
    setAlterandoId(u.id);
    try {
      const atualizado = await atualizarStatusUsuario(u.id, !u.ativo);
      setUsuarios(prev => prev.map(x => x.id === u.id ? { ...x, ativo: atualizado.ativo } : x));
      setSucesso(`Funcionário "${u.nome}" ${!u.ativo ? 'ativado' : 'desativado'} com sucesso.`);
      setTimeout(() => setSucesso(''), 4000);
    } catch (err: any) {
      setErro(err.message || 'Erro ao alterar status.');
      setTimeout(() => setErro(''), 4000);
    } finally {
      setAlterandoId(null);
    }
  }

  function resetForm() {
    setNome(''); setEmail(''); setSenha(''); setConfirmarSenha('');
    setPerfil('colaborador'); setErro(''); setMostrarSenha(false);
  }

  async function handleCadastrar(e: React.FormEvent) {
    e.preventDefault();
    setErro('');
    if (senha !== confirmarSenha) { setErro('As senhas não coincidem.'); return; }
    if (senha.length < 6) { setErro('A senha deve ter pelo menos 6 caracteres.'); return; }
    setSalvando(true);
    try {
      await criarUsuario({ nome, email, senha, perfil });
      setSucesso(`Funcionário "${nome}" cadastrado com sucesso!`);
      setTimeout(() => setSucesso(''), 5000);
      setShowModal(false);
      resetForm();
      carregar();
    } catch (err: any) {
      setErro(err.message || 'Erro ao cadastrar funcionário.');
    } finally { setSalvando(false); }
  }

  const filtrados = usuarios
    .filter(u => mostrarInativos ? true : u.ativo)
    .filter(u =>
      u.nome.toLowerCase().includes(busca.toLowerCase()) ||
      u.email.toLowerCase().includes(busca.toLowerCase())
    );

  const totalInativos = usuarios.filter(u => !u.ativo).length;

  return (
    <>
      <div className="page-header">
        <div className="page-title">Funcionários</div>
        <div className="page-subtitle">Visualize e gerencie as justificativas por funcionário.</div>
      </div>

      <div className="page-body">
        {sucesso && <div className="alert alert-success mb-4">{sucesso}</div>}
        {erro && <div className="alert alert-error mb-4">{erro}</div>}

        <div className="card">
          <div className="filter-bar">
            <input
              type="text"
              className="form-control"
              placeholder="Buscar por nome ou e-mail..."
              value={busca}
              onChange={e => setBusca(e.target.value)}
              style={{ maxWidth: 300 }}
            />

            {totalInativos > 0 && (
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, color: 'var(--slate-600)', userSelect: 'none' }}>
                <input
                  type="checkbox"
                  checked={mostrarInativos}
                  onChange={e => setMostrarInativos(e.target.checked)}
                  style={{ cursor: 'pointer' }}
                />
                Mostrar inativos ({totalInativos})
              </label>
            )}

            <span style={{ color: 'var(--slate-500)', fontSize: 13, flex: 1 }}>
              {filtrados.length} funcionário{filtrados.length !== 1 ? 's' : ''}
            </span>

            {podeCadastrar && (
              <button className="btn btn-primary btn-sm" onClick={() => { resetForm(); setShowModal(true); }}>
                + Novo Funcionário
              </button>
            )}
          </div>

          {loading ? (
            <div className="empty-state">
              <span className="spinner" style={{ color: 'var(--blue-600)', width: 32, height: 32 }} />
            </div>
          ) : filtrados.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-title">Nenhum funcionário encontrado</div>
              <div className="empty-state-text">Tente ajustar o termo de busca.</div>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>E-mail</th>
                    <th>Perfil</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'center' }}>Total</th>
                    <th style={{ textAlign: 'center' }}>Pendentes</th>
                    <th style={{ textAlign: 'center' }}>Aprovadas</th>
                    <th style={{ textAlign: 'center' }}>Reprovadas</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filtrados.map(u => {
                    const stats = totalPor(u.id);
                    const inativo = !u.ativo;
                    const eSiMesmo = u.id === usuario?.id;

                    return (
                      <tr key={u.id} style={{ opacity: inativo ? 0.55 : 1 }}>
                        <td className="td-strong" style={{ textDecoration: inativo ? 'line-through' : 'none' }}>
                          {u.nome}
                        </td>
                        <td className="td-muted">{u.email}</td>
                        <td>
                          <span style={{
                            fontSize: 11, fontWeight: 600,
                            padding: '3px 8px', borderRadius: 20,
                            background: 'var(--blue-50)', color: 'var(--blue-700)',
                            textTransform: 'uppercase', letterSpacing: '0.4px',
                          }}>
                            {PERFIL_LABEL[u.perfil] ?? u.perfil}
                          </span>
                        </td>
                        <td>
                          {inativo ? (
                            <span style={{
                              fontSize: 11, fontWeight: 600,
                              padding: '3px 8px', borderRadius: 20,
                              background: 'var(--slate-100)', color: 'var(--slate-500)',
                              textTransform: 'uppercase', letterSpacing: '0.4px',
                            }}>
                              Inativo
                            </span>
                          ) : (
                            <span style={{
                              fontSize: 11, fontWeight: 600,
                              padding: '3px 8px', borderRadius: 20,
                              background: 'var(--green-50)', color: 'var(--green-700)',
                              textTransform: 'uppercase', letterSpacing: '0.4px',
                            }}>
                              Ativo
                            </span>
                          )}
                        </td>
                        <td style={{ textAlign: 'center', fontWeight: 700 }}>{stats.total}</td>
                        <td style={{ textAlign: 'center' }}>
                          {stats.pendentes > 0 ? <span className="badge badge-pendente">{stats.pendentes}</span> : <span className="text-muted">—</span>}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          {stats.aprovadas > 0 ? <span className="badge badge-aprovada">{stats.aprovadas}</span> : <span className="text-muted">—</span>}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          {stats.reprovadas > 0 ? <span className="badge badge-reprovada">{stats.reprovadas}</span> : <span className="text-muted">—</span>}
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: 6 }}>
                            {stats.total > 0 && (
                              <button
                                className="btn btn-primary btn-sm"
                                onClick={() => router.push(`/dashboard/funcionarios/${u.id}`)}
                              >
                                Ver
                              </button>
                            )}
                            {podeCadastrar && !eSiMesmo && (
                              <button
                                className={`btn btn-sm ${inativo ? 'btn-success' : 'btn-danger'}`}
                                onClick={() => handleToggleStatus(u)}
                                disabled={alterandoId === u.id}
                                title={inativo ? 'Ativar acesso ao sistema' : 'Desativar acesso ao sistema'}
                              >
                                {alterandoId === u.id
                                  ? <span className="spinner" />
                                  : inativo ? 'Ativar' : 'Desativar'}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Cadastro */}
      {showModal && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowModal(false); }}>
          <div className="modal" style={{ maxWidth: 480 }}>
            <div className="modal-header">
              <span className="modal-title">Novo Funcionário</span>
              <button className="modal-close" onClick={() => setShowModal(false)}>x</button>
            </div>
            <form onSubmit={handleCadastrar}>
              <div className="modal-body">
                {erro && <div className="alert alert-error">{erro}</div>}

                <div className="form-group">
                  <label className="form-label">Nome completo *</label>
                  <input type="text" className="form-control" placeholder="Ex: Maria Souza"
                    value={nome} onChange={e => setNome(e.target.value)} required autoFocus />
                </div>

                <div className="form-group">
                  <label className="form-label">E-mail (login) *</label>
                  <input type="email" className="form-control" placeholder="maria@empresa.com"
                    value={email} onChange={e => setEmail(e.target.value)} required />
                </div>

                <div className="form-group">
                  <label className="form-label">Perfil *</label>
                  <select className="form-control" value={perfil}
                    onChange={e => setPerfil(e.target.value as any)} required>
                    <option value="colaborador">Colaborador</option>
                    <option value="gerente">Gerente</option>
                    <option value="rh">RH</option>
                    <option value="direcao">Direção</option>
                  </select>
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Senha *</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={mostrarSenha ? 'text' : 'password'}
                        className="form-control"
                        placeholder="Mínimo 6 caracteres"
                        value={senha}
                        onChange={e => setSenha(e.target.value)}
                        required
                        style={{ paddingRight: 64 }}
                      />
                      <button type="button" onClick={() => setMostrarSenha(v => !v)}
                        style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--slate-400)', fontSize: 12 }}>
                        {mostrarSenha ? 'Ocultar' : 'Mostrar'}
                      </button>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Confirmar senha *</label>
                    <input
                      type={mostrarSenha ? 'text' : 'password'}
                      className="form-control"
                      placeholder="Repita a senha"
                      value={confirmarSenha}
                      onChange={e => setConfirmarSenha(e.target.value)}
                      required
                      style={{ borderColor: confirmarSenha && confirmarSenha !== senha ? 'var(--red-400)' : undefined }}
                    />
                    {confirmarSenha && confirmarSenha !== senha && (
                      <span style={{ fontSize: 12, color: 'var(--red-600)', marginTop: 4, display: 'block' }}>As senhas não coincidem.</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary"
                  disabled={salvando || (!!confirmarSenha && confirmarSenha !== senha)}>
                  {salvando ? <><span className="spinner" /> Cadastrando...</> : 'Cadastrar Funcionário'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
