'use client';
import { useState, useEffect, useCallback } from 'react';
import {
  getPendentesGerente,
  getTiposOcorrencia,
  getUsuarios,
  avaliarJustificativa,
  carregarMapaAnexos,
  Justificativa,
  TipoOcorrencia,
  UsuarioCompleto,
  Anexo,
} from '@/lib/api';
import { AnexoCell } from '@/components/AnexoCell';
import { JustificativaDetalheModal } from '@/components/JustificativaDetalhe';

function formatData(d: string) {
  if (!d) return '—';
  const [y, m, day] = d.split('T')[0].split('-');
  return `${day}/${m}/${y}`;
}

const OCORRENCIA_LABELS: Record<string, string> = {
  entrada: 'Entrada', saida_almoco: 'Saida Almoco', retorno_almoco: 'Retorno Almoco', saida: 'Saida', dia_inteiro: 'Dia Inteiro',
};

function formatOcorrenciaHorario(j: Justificativa): string {
  if (j.ocorrencias && j.ocorrencias.length > 0) {
    return j.ocorrencias.map(o => {
      const label = OCORRENCIA_LABELS[o.tipoOcorrencia] || o.tipoOcorrencia;
      return o.horarioCorreto ? `${label} - ${o.horarioCorreto}` : label;
    }).join(' / ');
  }
  return j.periodo === 'dia_inteiro' ? 'Dia inteiro' : `${j.horaInicio || ''} – ${j.horaFim || ''}`;
}

export default function GerentePage() {
  const [pendentes, setPendentes] = useState<Justificativa[]>([]);
  const [tipos, setTipos] = useState<TipoOcorrencia[]>([]);
  const [usuarios, setUsuarios] = useState<UsuarioCompleto[]>([]);
  const [anexos, setAnexos] = useState<Record<string, Anexo[]>>({});
  const [loading, setLoading] = useState(true);

  const [selecionada, setSelecionada] = useState<Justificativa | null>(null);
  const [statusAval, setStatusAval] = useState<'aprovada' | 'reprovada'>('aprovada');
  const [comentario, setComentario] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [detalheId, setDetalheId] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    setLoading(true);
    try {
      const [p, t, u] = await Promise.all([
        getPendentesGerente(),
        getTiposOcorrencia(),
        getUsuarios(),
      ]);
      setPendentes(p);
      setTipos(t);
      setUsuarios(u);
      if (p.length > 0) {
        const mapa = await carregarMapaAnexos(p.map(x => x.id));
        setAnexos(mapa);
      }
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  function nomeColaborador(id: string) {
    return usuarios.find(u => u.id === id)?.nome ?? id.slice(0, 8) + '...';
  }

  async function handleAvaliar(e: React.FormEvent) {
    e.preventDefault();
    if (!selecionada) return;
    setErro(''); setSalvando(true);
    try {
      await avaliarJustificativa(selecionada.id, { status: statusAval, comentario });
      setSucesso(`Justificativa ${statusAval === 'aprovada' ? 'aprovada' : 'reprovada'} com sucesso!`);
      setSelecionada(null);
      carregar();
    } catch (err: any) {
      setErro(err.message || 'Erro ao avaliar');
    } finally { setSalvando(false); }
  }

  function abrir(j: Justificativa) {
    setSelecionada(j);
    setStatusAval('aprovada');
    setComentario('');
    setErro('');
  }

  return (
    <>
      <div className="page-header">
        <div className="page-title">Pendentes da Equipe</div>
        <div className="page-subtitle">Justificativas aguardando sua avaliação.</div>
      </div>

      <div className="page-body">
        {sucesso && <div className="alert alert-success mb-4">{sucesso}</div>}

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value" style={{ color: 'var(--amber-600)' }}>{pendentes.length}</div>
            <div className="stat-label">Aguardando avaliação</div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">Justificativas Pendentes</span>
          </div>

          {loading ? (
            <div className="empty-state">
              <span className="spinner" style={{ color: 'var(--blue-600)', width: 32, height: 32 }} />
            </div>
          ) : pendentes.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-title">Tudo em dia!</div>
              <div className="empty-state-text">Nenhuma justificativa pendente no momento.</div>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Colaborador</th>
                    <th>Motivo</th>
                    <th>Horario Correto</th>
                    <th>Descrição</th>
                    <th>Anexo</th>
                    <th>Enviado em</th>
                    <th>Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {pendentes.map(j => {
                    const tipo = tipos.find(t => t.id === j.tipoOcorrenciaId);
                    return (
                      <tr key={j.id}>
                        <td className="td-strong">{formatData(j.dataOcorrencia)}</td>
                        <td className="td-strong">{nomeColaborador(j.colaboradorId)}</td>
                        <td>{tipo?.nome ?? '—'}</td>
                        <td>{formatOcorrenciaHorario(j)}</td>
                        <td style={{ maxWidth: 200 }}>
                          <span title={j.descricao} style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {j.descricao}
                          </span>
                        </td>
                        <td><AnexoCell anexos={anexos[j.id] ?? []} /></td>
                        <td className="td-muted">{formatData(j.criadoEm)}</td>
                        <td>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button className="btn btn-outline btn-sm" onClick={() => setDetalheId(j.id)}>
                              Ver
                            </button>
                            <button className="btn btn-primary btn-sm" onClick={() => abrir(j)}>
                              Avaliar
                            </button>
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

      {selecionada && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setSelecionada(null); }}>
          <div className="modal">
            <div className="modal-header">
              <span className="modal-title">Avaliar Justificativa</span>
              <button className="modal-close" onClick={() => setSelecionada(null)}>x</button>
            </div>
            <form onSubmit={handleAvaliar}>
              <div className="modal-body">
                {erro && <div className="alert alert-error">{erro}</div>}

                <div style={{ background: 'var(--slate-50)', borderRadius: 'var(--radius)', padding: '14px 16px', border: '1px solid var(--slate-200)' }}>
                  <div style={{ fontSize: 11, color: 'var(--slate-500)', marginBottom: 8, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Resumo da justificativa
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 16px' }}>
                    <div>
                      <div style={{ fontSize: 11, color: 'var(--slate-400)' }}>Colaborador</div>
                      <div style={{ fontWeight: 600 }}>{nomeColaborador(selecionada.colaboradorId)}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: 'var(--slate-400)' }}>Data</div>
                      <div style={{ fontWeight: 600 }}>{formatData(selecionada.dataOcorrencia)}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: 'var(--slate-400)' }}>Horario Correto</div>
                      <div style={{ fontWeight: 600 }}>{formatOcorrenciaHorario(selecionada)}</div>
                    </div>
                  </div>
                  <div style={{ marginTop: 8 }}>
                    <div style={{ fontSize: 11, color: 'var(--slate-400)' }}>Descrição</div>
                    <div style={{ color: 'var(--slate-700)' }}>{selecionada.descricao}</div>
                  </div>
                  {(anexos[selecionada.id] ?? []).length > 0 && (
                    <div style={{ marginTop: 8 }}>
                      <div style={{ fontSize: 11, color: 'var(--slate-400)', marginBottom: 4 }}>Anexo(s)</div>
                      <AnexoCell anexos={anexos[selecionada.id] ?? []} />
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Decisão *</label>
                  <div style={{ display: 'flex', gap: 10 }}>
                    {(['aprovada', 'reprovada'] as const).map(s => (
                      <label key={s} style={{
                        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                        padding: '10px', border: `2px solid ${statusAval === s ? (s === 'aprovada' ? 'var(--green-500)' : 'var(--red-500)') : 'var(--slate-200)'}`,
                        borderRadius: 'var(--radius)', cursor: 'pointer',
                        background: statusAval === s ? (s === 'aprovada' ? 'var(--green-50)' : 'var(--red-50)') : 'white',
                        color: statusAval === s ? (s === 'aprovada' ? 'var(--green-700)' : 'var(--red-700)') : 'var(--slate-600)',
                        fontWeight: 600, transition: 'all 0.15s',
                      }}>
                        <input type="radio" name="status" value={s} checked={statusAval === s} onChange={() => setStatusAval(s)} style={{ display: 'none' }} />
                        {s === 'aprovada' ? 'Aprovar' : 'Reprovar'}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Comentário {statusAval === 'reprovada' ? '*' : '(opcional)'}</label>
                  <textarea
                    className="form-control"
                    placeholder={statusAval === 'aprovada' ? 'Adicione um comentário se necessário...' : 'Explique o motivo da reprovação...'}
                    value={comentario}
                    onChange={e => setComentario(e.target.value)}
                    required={statusAval === 'reprovada'}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setSelecionada(null)}>Cancelar</button>
                <button type="submit" className={`btn ${statusAval === 'aprovada' ? 'btn-success' : 'btn-danger'}`} disabled={salvando}>
                  {salvando ? <><span className="spinner" /> Salvando...</> : statusAval === 'aprovada' ? 'Confirmar Aprovação' : 'Confirmar Reprovação'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {detalheId && (
        <JustificativaDetalheModal justificativaId={detalheId} onClose={() => setDetalheId(null)} podeAvaliar={true} onAvaliado={carregar} />
      )}
    </>
  );
}
