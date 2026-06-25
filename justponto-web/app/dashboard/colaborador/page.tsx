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

const STATUS_LABEL: Record<string, string> = {
  pendente: 'Pendente', aprovada: 'Aprovada', reprovada: 'Reprovada',
};

function formatData(d: string) {
  if (!d) return '—';
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
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [salvando, setSalvando] = useState(false);

  const [tipoId, setTipoId] = useState('');
  const [dataOcorrencia, setDataOcorrencia] = useState('');
  const [periodo, setPeriodo] = useState('dia_inteiro');
  const [horaInicio, setHoraInicio] = useState('');
  const [horaFim, setHoraFim] = useState('');
  const [descricao, setDescricao] = useState('');
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);

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

  async function handleCriar(e: React.FormEvent) {
    e.preventDefault();
    setErro(''); setSucesso(''); setSalvando(true);
    try {
      await criarJustificativa(
        {
          tipoOcorrenciaId: tipoId,
          dataOcorrencia,
          periodo,
          horaInicio: periodo === 'parcial' ? horaInicio : undefined,
          horaFim: periodo === 'parcial' ? horaFim : undefined,
          descricao,
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
    setTipoId(''); setDataOcorrencia(''); setPeriodo('dia_inteiro');
    setHoraInicio(''); setHoraFim(''); setDescricao(''); setErro('');
    setArquivo(null); setDragOver(false);
  }

  function abrirModal() { resetForm(); setSucesso(''); setShowModal(true); }

  const tipoSelecionado = tipos.find(t => t.id === tipoId);
  const pendentes  = justificativas.filter(j => j.status === 'pendente').length;
  const aprovadas  = justificativas.filter(j => j.status === 'aprovada').length;
  const reprovadas = justificativas.filter(j => j.status === 'reprovada').length;

  return (
    <>
      <div className="page-header">
        <div className="page-title">Minhas Justificativas</div>
        <div className="page-subtitle">Olá, {usuario?.nome}! Acompanhe e registre suas justificativas.</div>
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
            <span className="card-title">Histórico de Justificativas</span>
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
              <div className="empty-state-text">Clique em "Nova Justificativa" para começar.</div>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Motivo</th>
                    <th>Período</th>
                    <th>Descrição</th>
                    <th>Status</th>
                    <th>Anexo</th>
                    <th>Observações Gerência</th>
                  </tr>
                </thead>
                <tbody>
                  {justificativas.map(j => {
                    const tipo = tipos.find(t => t.id === j.tipoOcorrenciaId);
                    return (
                      <tr key={j.id}>
                        <td className="td-strong">{formatData(j.dataOcorrencia)}</td>
                        <td>{tipo?.nome ?? '—'}</td>
                        <td>{j.periodo === 'dia_inteiro' ? 'Dia inteiro' : `${j.horaInicio} – ${j.horaFim}`}</td>
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
                            {j.comentarioAvaliacao ?? '—'}
                          </span>
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

      {showModal && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowModal(false); }}>
          <div className="modal">
            <div className="modal-header">
              <span className="modal-title">Nova Justificativa</span>
              <button className="modal-close" onClick={() => setShowModal(false)}>x</button>
            </div>
            <form onSubmit={handleCriar}>
              <div className="modal-body">
                {erro && <div className="alert alert-error">{erro}</div>}

                <div className="form-group">
                  <label className="form-label">Motivo *</label>
                  <select className="form-control" value={tipoId} onChange={e => setTipoId(e.target.value)} required>
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

                <div className="form-group">
                  <label className="form-label">Data da ocorrência *</label>
                  <input type="date" className="form-control" value={dataOcorrencia} onChange={e => setDataOcorrencia(e.target.value)} required max={new Date().toISOString().split('T')[0]} />
                </div>

                <div className="form-group">
                  <label className="form-label">Período *</label>
                  <select className="form-control" value={periodo} onChange={e => setPeriodo(e.target.value)}>
                    <option value="dia_inteiro">Dia inteiro</option>
                    <option value="parcial">Parcial (horas)</option>
                  </select>
                </div>

                {periodo === 'parcial' && (
                  <div className="grid-2">
                    <div className="form-group">
                      <label className="form-label">Hora início</label>
                      <input type="time" className="form-control" value={horaInicio} onChange={e => setHoraInicio(e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Hora fim</label>
                      <input type="time" className="form-control" value={horaFim} onChange={e => setHoraFim(e.target.value)} />
                    </div>
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Descrição *</label>
                  <textarea
                    className="form-control"
                    placeholder="Descreva o motivo da ausência ou não registro..."
                    value={descricao}
                    onChange={e => setDescricao(e.target.value)}
                    required
                  />
                </div>

                {/* Área de upload */}
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
