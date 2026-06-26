'use client';
import React, { useState, useEffect } from 'react';
import { getJustificativaDetalhe, getAnexoDownloadUrl, avaliarJustificativa, JustificativaDetalhe as JDType } from '@/lib/api';

const OCORRENCIA_LABELS: Record<string, string> = {
  entrada: 'Entrada',
  saida_almoco: 'Saida Almoco',
  retorno_almoco: 'Retorno Almoco',
  saida: 'Saida',
  dia_inteiro: 'Dia Inteiro',
};

const STATUS_LABEL: Record<string, string> = {
  pendente: 'Pendente',
  aprovada: 'Aprovada',
  reprovada: 'Reprovada',
};

function formatData(d: string) {
  if (!d) return '--';
  const [y, m, day] = d.split('T')[0].split('-');
  return `${day}/${m}/${y}`;
}

function formatDataHora(d: string) {
  if (!d) return '--';
  const dt = new Date(d);
  const dia = dt.toLocaleDateString('pt-BR');
  const hora = dt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  return `${dia} as ${hora}`;
}

interface Props {
  justificativaId: string;
  onClose: () => void;
  podeAvaliar?: boolean;
  onAvaliado?: () => void;
}

export function JustificativaDetalheModal({ justificativaId, onClose, podeAvaliar, onAvaliado }: Props) {
  const [detalhe, setDetalhe] = useState<JDType | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  const [comentario, setComentario] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [sucesso, setSucesso] = useState('');
  const [statusAval, setStatusAval] = useState<'aprovada' | 'reprovada'>('aprovada');

  useEffect(() => {
    setLoading(true);
    getJustificativaDetalhe(justificativaId)
      .then(d => setDetalhe(d))
      .catch(e => setErro(e.message || 'Erro ao carregar detalhe'))
      .finally(() => setLoading(false));
  }, [justificativaId]);

  async function handleDownload(anexoId: string, nome: string) {
    try {
      const { url } = await getAnexoDownloadUrl(anexoId);
      window.open(url, '_blank');
    } catch {
      alert('Erro ao baixar anexo');
    }
  }

  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal" style={{ maxWidth: 600 }}>
        <div className="modal-header">
          <span className="modal-title">Detalhe da Justificativa</span>
          <button className="modal-close" onClick={onClose}>x</button>
        </div>

        <div className="modal-body">
          {loading ? (
            <div style={{ textAlign: 'center', padding: 32 }}>
              <span className="spinner" style={{ color: 'var(--blue-600)', width: 28, height: 28 }} />
            </div>
          ) : erro ? (
            <div className="alert alert-error">{erro}</div>
          ) : detalhe ? (
            <>
              {/* Status */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className={`badge badge-${detalhe.status}`} style={{ fontSize: 13, padding: '5px 14px' }}>
                  {STATUS_LABEL[detalhe.status]}
                </span>
                <span style={{ fontSize: 12, color: 'var(--slate-400)' }}>
                  Criado em {formatDataHora(detalhe.criadoEm)}
                </span>
              </div>

              {/* Info grid */}
              <div style={{ background: 'var(--slate-50)', borderRadius: 'var(--radius)', padding: '16px 18px', border: '1px solid var(--slate-200)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 20px' }}>
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--slate-400)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Colaborador</div>
                    <div style={{ fontWeight: 600, marginTop: 2 }}>{detalhe.colaboradorNome}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--slate-400)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Data da Ocorrencia</div>
                    <div style={{ fontWeight: 600, marginTop: 2 }}>{formatData(detalhe.dataOcorrencia)}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--slate-400)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Motivo (Justificativa)</div>
                    <div style={{ fontWeight: 600, marginTop: 2 }}>{detalhe.tipoNome}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--slate-400)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Periodo</div>
                    <div style={{ fontWeight: 600, marginTop: 2 }}>
                      {detalhe.periodo === 'dia_inteiro' ? 'Dia inteiro' : `${detalhe.horaInicio || ''} - ${detalhe.horaFim || ''}`}
                    </div>
                  </div>
                </div>
              </div>

              {/* Ocorrências */}
              {detalhe.ocorrencias && detalhe.ocorrencias.length > 0 && (
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--slate-600)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Ocorrencias Selecionadas
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {detalhe.ocorrencias.map(o => (
                      <div key={o.id} style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        background: 'var(--slate-50)', border: '1px solid var(--slate-200)',
                        borderRadius: 'var(--radius)', padding: '10px 14px',
                      }}>
                        <span style={{ fontWeight: 600, fontSize: 13 }}>{OCORRENCIA_LABELS[o.tipoOcorrencia] || o.tipoOcorrencia}</span>
                        {o.horarioCorreto && (
                          <span style={{ fontSize: 13, color: 'var(--blue-700)', fontWeight: 600 }}>
                            {o.horarioCorreto}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Motivo Outros */}
              {detalhe.motivoOutros && (
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--slate-600)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Motivo (Outros)
                  </div>
                  <div style={{ fontSize: 14, color: 'var(--slate-700)' }}>{detalhe.motivoOutros}</div>
                </div>
              )}

              {/* Descrição */}
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--slate-600)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Observacoes
                </div>
                <div style={{ fontSize: 14, color: 'var(--slate-700)', lineHeight: 1.6 }}>{detalhe.descricao}</div>
              </div>

              {/* Anexos */}
              {detalhe.anexos && detalhe.anexos.length > 0 && (
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--slate-600)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Anexos
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {detalhe.anexos.map(a => (
                      <div key={a.id} style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        background: 'var(--blue-50)', border: '1px solid var(--blue-100)',
                        borderRadius: 'var(--radius)', padding: '10px 14px',
                      }}>
                        <span style={{ fontSize: 13, fontWeight: 500 }}>{a.nomeArquivo}</span>
                        <button
                          className="btn btn-sm btn-primary"
                          onClick={() => handleDownload(a.id, a.nomeArquivo)}
                          style={{ fontSize: 12 }}
                        >
                          Baixar
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Aprovação */}
              {detalhe.status !== 'pendente' && (
                <div style={{ background: detalhe.status === 'aprovada' ? 'var(--green-50)' : 'var(--red-50)', borderRadius: 'var(--radius)', padding: '14px 18px', border: `1px solid ${detalhe.status === 'aprovada' ? 'var(--green-100)' : 'var(--red-100)'}` }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: detalhe.status === 'aprovada' ? 'var(--green-700)' : 'var(--red-700)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {detalhe.status === 'aprovada' ? 'Aprovacao' : 'Reprovacao'}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 16px' }}>
                    <div>
                      <div style={{ fontSize: 11, color: 'var(--slate-400)' }}>Avaliado por</div>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{detalhe.aprovadorNome || '--'}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: 'var(--slate-400)' }}>Data/Hora</div>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{detalhe.avaliadoEm ? formatDataHora(detalhe.avaliadoEm) : '--'}</div>
                    </div>
                  </div>
                  {detalhe.comentarioAvaliacao && (
                    <div style={{ marginTop: 10 }}>
                      <div style={{ fontSize: 11, color: 'var(--slate-400)' }}>Comentario</div>
                      <div style={{ fontSize: 13, color: 'var(--slate-700)', marginTop: 2 }}>{detalhe.comentarioAvaliacao}</div>
                    </div>
                  )}
                </div>
              )}
              {/* Avaliar inline */}
              {podeAvaliar && detalhe.status === 'pendente' && (
                <div style={{ borderTop: '1px solid var(--slate-200)', paddingTop: 16 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--slate-600)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Avaliar Justificativa
                  </div>
                  {sucesso && <div className="alert alert-success" style={{ marginBottom: 10 }}>{sucesso}</div>}

                  <div className="form-group">
                    <label className="form-label">Decisao *</label>
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
                          <input type="radio" name="status-detalhe" value={s} checked={statusAval === s} onChange={() => setStatusAval(s)} style={{ display: 'none' }} />
                          {s === 'aprovada' ? 'Aprovar' : 'Reprovar'}
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Comentario {statusAval === 'reprovada' ? '*' : '(opcional)'}</label>
                    <textarea
                      className="form-control"
                      placeholder={statusAval === 'aprovada' ? 'Adicione um comentario se necessario...' : 'Explique o motivo da reprovacao...'}
                      value={comentario}
                      onChange={e => setComentario(e.target.value)}
                      required={statusAval === 'reprovada'}
                      rows={2}
                    />
                  </div>

                  <button
                    className={`btn ${statusAval === 'aprovada' ? 'btn-success' : 'btn-danger'}`}
                    disabled={salvando || !statusAval || (statusAval === 'reprovada' && !comentario.trim())}
                    onClick={async () => {
                      if (!statusAval) return;
                      setSalvando(true); setErro('');
                      try {
                        await avaliarJustificativa(justificativaId, { status: statusAval, comentario: comentario || undefined });
                        setSucesso(statusAval === 'aprovada' ? 'Justificativa aprovada!' : 'Justificativa reprovada.');
                        setTimeout(() => { onAvaliado?.(); onClose(); }, 1200);
                      } catch (e: any) { setErro(e.message); }
                      finally { setSalvando(false); }
                    }}
                    style={{ width: '100%' }}
                  >
                    {salvando ? <><span className="spinner" /> Salvando...</> : statusAval === 'aprovada' ? 'Confirmar Aprovacao' : 'Confirmar Reprovacao'}
                  </button>
                </div>
              )}
            </>
          ) : null}
        </div>

        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onClose}>Fechar</button>
        </div>
      </div>
    </div>
  );
}
