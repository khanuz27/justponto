'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/auth';
import {
  getMinhasJustificativas,
  getTiposOcorrencia,
  criarJustificativa,
  carregarMapaAnexos,
  Justificativa,
  TipoOcorrencia,
  Anexo,
} from '@/lib/api';
import { AnexoCell } from '@/components/AnexoCell';
import { JustificativaDetalheModal } from '@/components/JustificativaDetalhe';

const STATUS_LABEL: Record<string, string> = {
  pendente: 'Pendente', aprovada: 'Aprovada', reprovada: 'Reprovada',
};

const OCORRENCIA_TIPOS = [
  { key: 'entrada', label: 'Entrada' },
  { key: 'saida_almoco', label: 'Saida Almoco' },
  { key: 'retorno_almoco', label: 'Retorno Almoco' },
  { key: 'saida', label: 'Saida' },
  { key: 'dia_inteiro', label: 'Dia Inteiro' },
] as const;

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
  return j.periodo === 'dia_inteiro' ? 'Dia inteiro' : `${j.horaInicio || ''} - ${j.horaFim || ''}`;
}

function formatData(d: string) {
  if (!d) return '--';
  const [y, m, day] = d.split('T')[0].split('-');
  return `${day}/${m}/${y}`;
}

export default function ColaboradorPage() {
  const { usuario } = useAuth();
  const [justificativas, setJustificativas] = useState<Justificativa[]>([]);
  const [tipos, setTipos] = useState<TipoOcorrencia[]>([]);
  const [anexos, setAnexos] = useState<Record<string, Anexo[]>>({});
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [detalheId, setDetalheId] = useState<string | null>(null);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [salvando, setSalvando] = useState(false);

  // Form state
  const [tipoId, setTipoId] = useState('');
  const [dataOcorrencia, setDataOcorrencia] = useState('');
  const [descricao, setDescricao] = useState('');
  const [motivoOutros, setMotivoOutros] = useState('');
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);

  // Ocorrências (checkboxes)
  const [ocorrenciasSelecionadas, setOcorrenciasSelecionadas] = useState<Record<string, boolean>>({});
  const [ocorrenciasHorarios, setOcorrenciasHorarios] = useState<Record<string, string>>({});

  const carregar = useCallback(async () => {
    setLoading(true);
    try {
      const [j, t] = await Promise.all([getMinhasJustificativas(), getTiposOcorrencia()]);
      setJustificativas(j);
      setTipos(t);
      if (j.length > 0) {
        const mapa = await carregarMapaAnexos(j.map(x => x.id));
        setAnexos(mapa);
      }
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  function handleOcorrenciaToggle(key: string) {
    if (key === 'dia_inteiro') {
      // Dia inteiro é exclusivo
      const novoEstado = !ocorrenciasSelecionadas['dia_inteiro'];
      if (novoEstado) {
        // Desmarca tudo e marca só dia_inteiro
        setOcorrenciasSelecionadas({ dia_inteiro: true });
        setOcorrenciasHorarios({});
      } else {
        setOcorrenciasSelecionadas({});
      }
    } else {
      // Desmarca dia_inteiro se estiver marcado
      setOcorrenciasSelecionadas(prev => {
        const next = { ...prev };
        delete next['dia_inteiro'];
        next[key] = !prev[key];
        if (!next[key]) {
          delete next[key];
          setOcorrenciasHorarios(h => { const n = { ...h }; delete n[key]; return n; });
        }
        return next;
      });
    }
  }

  function handleHorarioChange(key: string, value: string) {
    setOcorrenciasHorarios(prev => ({ ...prev, [key]: value }));
  }

  const isDiaInteiro = !!ocorrenciasSelecionadas['dia_inteiro'];
  const tipoSelecionado = tipos.find(t => t.id === tipoId);
  const isOutros = tipoSelecionado?.nome?.toLowerCase() === 'outros';

  async function handleCriar(e: React.FormEvent) {
    e.preventDefault();
    setErro(''); setSucesso(''); setSalvando(true);

    // Validações
    const keys = Object.keys(ocorrenciasSelecionadas).filter(k => ocorrenciasSelecionadas[k]);
    if (keys.length === 0) {
      setErro('Selecione pelo menos uma ocorrencia.');
      setSalvando(false);
      return;
    }

    // Verificar horários preenchidos (exceto dia_inteiro)
    if (!isDiaInteiro) {
      for (const k of keys) {
        if (!ocorrenciasHorarios[k]) {
          const label = OCORRENCIA_TIPOS.find(o => o.key === k)?.label || k;
          setErro(`Informe o horario correto para "${label}".`);
          setSalvando(false);
          return;
        }
      }
    }

    if (isOutros && !motivoOutros.trim()) {
      setErro('Ao selecionar "Outros", e obrigatorio descrever o motivo.');
      setSalvando(false);
      return;
    }

    const ocorrencias = keys.map(k => ({
      tipo: k,
      horarioCorreto: k === 'dia_inteiro' ? undefined : ocorrenciasHorarios[k],
    }));

    // Derivar periodo
    const periodo = isDiaInteiro ? 'dia_inteiro' : 'parcial';

    try {
      await criarJustificativa(
        {
          tipoOcorrenciaId: tipoId,
          dataOcorrencia,
          periodo,
          descricao,
          motivoOutros: isOutros ? motivoOutros : undefined,
          ocorrencias,
        },
        arquivo,
      );
      setSucesso('Justificativa enviada com sucesso!');
      setShowModal(false);
      resetForm();
      carregar();
    } catch (err: any) {
      setErro(err.message || 'Erro ao enviar justificativa');
    } finally { setSalvando(false); }
  }

  function resetForm() {
    setTipoId(''); setDataOcorrencia(''); setDescricao(''); setErro('');
    setMotivoOutros(''); setArquivo(null); setDragOver(false);
    setOcorrenciasSelecionadas({}); setOcorrenciasHorarios({});
  }

  function abrirModal() { resetForm(); setSucesso(''); setShowModal(true); }

  const pendentes  = justificativas.filter(j => j.status === 'pendente').length;
  const aprovadas  = justificativas.filter(j => j.status === 'aprovada').length;
  const reprovadas = justificativas.filter(j => j.status === 'reprovada').length;

  return (
    <>
      <div className="page-header">
        <div className="page-title">Minhas Justificativas</div>
        <div className="page-subtitle">Ola, {usuario?.nome}! Acompanhe e registre suas justificativas.</div>
      </div>

      <div className="page-body">
        {sucesso && <div className="alert alert-success mb-4">{sucesso}</div>}

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">{justificativas.length}</div>
            <div className="stat-label">Total enviadas</div>
          </div>
          <div className="stat-card">
            <div className="stat-value" style={{ color: 'var(--amber-600)' }}>{pendentes}</div>
            <div className="stat-label">Pendentes</div>
          </div>
          <div className="stat-card">
            <div className="stat-value" style={{ color: 'var(--green-600)' }}>{aprovadas}</div>
            <div className="stat-label">Aprovadas</div>
          </div>
          <div className="stat-card">
            <div className="stat-value" style={{ color: 'var(--red-600)' }}>{reprovadas}</div>
            <div className="stat-label">Reprovadas</div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">Historico de Justificativas</span>
            <button className="btn btn-primary btn-sm" onClick={abrirModal}>
              + Nova Justificativa
            </button>
          </div>

          {loading ? (
            <div className="empty-state">
              <span className="spinner" style={{ color: 'var(--blue-600)', width: 32, height: 32 }} />
            </div>
          ) : justificativas.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-title">Nenhuma justificativa ainda</div>
              <div className="empty-state-text">Clique em "Nova Justificativa" para comecar.</div>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Motivo</th>
                    <th>Ocorrencia / Horario Correto</th>
                    <th>Descricao</th>
                    <th>Status</th>
                    <th>Anexo</th>
                    <th>Obs. Gerencia</th>
                    <th>Acao</th>
                  </tr>
                </thead>
                <tbody>
                  {justificativas.map(j => {
                    const tipo = tipos.find(t => t.id === j.tipoOcorrenciaId);
                    return (
                      <tr key={j.id}>
                        <td className="td-strong">{formatData(j.dataOcorrencia)}</td>
                        <td>{tipo?.nome ?? '--'}</td>
                        <td>{formatOcorrenciaHorario(j)}</td>
                        <td style={{ maxWidth: 200 }}>
                          <span title={j.descricao} style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {j.descricao}
                          </span>
                        </td>
                        <td>
                          <span className={`badge badge-${j.status}`}>{STATUS_LABEL[j.status]}</span>
                        </td>
                        <td><AnexoCell anexos={anexos[j.id] ?? []} /></td>
                        <td style={{ maxWidth: 200, color: j.comentarioAvaliacao ? 'var(--slate-700)' : 'var(--slate-400)', fontSize: 13 }}>
                          <span title={j.comentarioAvaliacao ?? ''} style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {j.comentarioAvaliacao ?? '--'}
                          </span>
                        </td>
                        <td>
                          <button className="btn btn-outline btn-sm" onClick={() => setDetalheId(j.id)}>
                            Ver
                          </button>
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

      {/* Modal Detalhe */}
      {detalheId && (
        <JustificativaDetalheModal justificativaId={detalheId} onClose={() => setDetalheId(null)} />
      )}

      {/* Modal Nova Justificativa */}
      {showModal && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowModal(false); }}>
          <div className="modal" style={{ maxWidth: 580 }}>
            <div className="modal-header">
              <span className="modal-title">Nova Justificativa</span>
              <button className="modal-close" onClick={() => setShowModal(false)}>x</button>
            </div>
            <form onSubmit={handleCriar}>
              <div className="modal-body">
                {erro && <div className="alert alert-error">{erro}</div>}

                {/* Bloco 1 — Ocorrências */}
                <div className="form-group">
                  <label className="form-label">Ocorrencia *</label>
                  <div style={{ fontSize: 12, color: 'var(--slate-500)', marginBottom: 8 }}>
                    Selecione os horarios que esta justificando e informe o horario correto.
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {OCORRENCIA_TIPOS.map(o => {
                      const checked = !!ocorrenciasSelecionadas[o.key];
                      const disabled = o.key !== 'dia_inteiro' && isDiaInteiro;
                      return (
                        <div key={o.key} style={{
                          display: 'flex', alignItems: 'center', gap: 12,
                          background: checked ? 'var(--blue-50)' : 'var(--slate-50)',
                          border: `1.5px solid ${checked ? 'var(--blue-300)' : 'var(--slate-200)'}`,
                          borderRadius: 'var(--radius)', padding: '10px 14px',
                          opacity: disabled ? 0.4 : 1,
                          transition: 'all 0.15s',
                        }}>
                          <input
                            type="checkbox"
                            checked={checked}
                            disabled={disabled}
                            onChange={() => handleOcorrenciaToggle(o.key)}
                            style={{ width: 18, height: 18, accentColor: 'var(--blue-600)', cursor: disabled ? 'not-allowed' : 'pointer' }}
                          />
                          <span style={{ flex: 1, fontWeight: 600, fontSize: 13, color: checked ? 'var(--blue-700)' : 'var(--slate-700)' }}>
                            {o.label}
                          </span>
                          {checked && o.key !== 'dia_inteiro' && (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
                              <span style={{ fontSize: 10, color: 'var(--slate-500)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.3px' }}>Horario correto</span>
                              <input
                                type="time"
                                className="form-control"
                                value={ocorrenciasHorarios[o.key] || ''}
                                onChange={e => handleHorarioChange(o.key, e.target.value)}
                                placeholder="Horario correto"
                                style={{ width: 130, fontSize: 13, padding: '6px 10px' }}
                                required
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Bloco 2 — Data */}
                <div className="form-group">
                  <label className="form-label">Data da ocorrencia *</label>
                  <input type="date" className="form-control" value={dataOcorrencia} onChange={e => setDataOcorrencia(e.target.value)} required max={new Date().toISOString().split('T')[0]} />
                </div>

                {/* Bloco 3 — Justificativa (motivo) */}
                <div className="form-group">
                  <label className="form-label">Justificativa (motivo) *</label>
                  <select className="form-control" value={tipoId} onChange={e => { setTipoId(e.target.value); setMotivoOutros(''); }} required>
                    <option value="">Selecione o motivo...</option>
                    {tipos.filter(t => t.ativo).map(t => (
                      <option key={t.id} value={t.id}>{t.nome}{t.exigeAnexo ? ' (requer comprovante)' : ''}</option>
                    ))}
                  </select>
                  {tipoSelecionado?.exigeAnexo && (
                    <span className="form-hint" style={{ color: 'var(--amber-600)' }}>
                      Este motivo exige comprovante.
                    </span>
                  )}
                </div>

                {/* Campo Outros */}
                {isOutros && (
                  <div className="form-group">
                    <label className="form-label">Descreva o motivo *</label>
                    <textarea
                      className="form-control"
                      placeholder="Descreva detalhadamente o motivo da justificativa..."
                      value={motivoOutros}
                      onChange={e => setMotivoOutros(e.target.value)}
                      required
                      rows={3}
                    />
                  </div>
                )}

                {/* Bloco 4 — Descrição */}
                <div className="form-group">
                  <label className="form-label">Observacoes *</label>
                  <textarea
                    className="form-control"
                    placeholder="Descreva detalhes adicionais sobre a ausencia ou nao registro..."
                    value={descricao}
                    onChange={e => setDescricao(e.target.value)}
                    required
                  />
                </div>

                {/* Bloco 5 — Upload */}
                <div className="form-group">
                  <label className="form-label">
                    Comprovante / Anexo
                    {tipoSelecionado?.exigeAnexo && <span style={{ color: 'var(--red-500)', marginLeft: 4 }}>*</span>}
                  </label>
                  <div
                    onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={e => {
                      e.preventDefault();
                      setDragOver(false);
                      const f = e.dataTransfer.files?.[0];
                      if (f) setArquivo(f);
                    }}
                    onClick={() => document.getElementById('upload-input')?.click()}
                    style={{
                      border: `2px dashed ${dragOver ? 'var(--blue-500)' : arquivo ? 'var(--green-400)' : 'var(--slate-300)'}`,
                      borderRadius: 'var(--radius)',
                      padding: '20px 16px',
                      textAlign: 'center',
                      cursor: 'pointer',
                      background: dragOver ? 'var(--blue-50)' : arquivo ? 'var(--green-50)' : 'var(--slate-50)',
                      transition: 'all 0.15s',
                      userSelect: 'none',
                    }}
                  >
                    <input
                      id="upload-input"
                      type="file"
                      accept="image/*,.pdf,.doc,.docx"
                      style={{ display: 'none' }}
                      onChange={e => {
                        const f = e.target.files?.[0];
                        if (f) setArquivo(f);
                        e.target.value = '';
                      }}
                    />
                    {arquivo ? (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                        <div style={{ textAlign: 'left' }}>
                          <div style={{ fontWeight: 600, color: 'var(--green-700)', fontSize: 13 }}>{arquivo.name}</div>
                          <div style={{ fontSize: 12, color: 'var(--slate-500)' }}>
                            {(arquivo.size / 1024).toFixed(0)} KB
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={e => { e.stopPropagation(); setArquivo(null); }}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--red-500)', fontSize: 18, lineHeight: 1, padding: 2 }}
                          title="Remover arquivo"
                        >
                          &times;
                        </button>
                      </div>
                    ) : (
                      <div style={{ color: 'var(--slate-500)' }}>
                        <div style={{ fontSize: 22, marginBottom: 4 }}>+</div>
                        <div style={{ fontSize: 13, fontWeight: 500 }}>Clique ou arraste o arquivo aqui</div>
                        <div style={{ fontSize: 11, marginTop: 4, color: 'var(--slate-400)' }}>PDF, imagens ou documentos</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={salvando}>
                  {salvando ? <><span className="spinner" /> Enviando...</> : 'Enviar Justificativa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
