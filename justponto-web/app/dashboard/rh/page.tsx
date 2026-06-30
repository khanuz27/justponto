'use client';
import React, { useState, useEffect, useCallback } from 'react';
import {
  getTodasJustificativas,
  getTiposOcorrencia,
  getUsuarios,
  marcarAjusteLancado,
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

const STATUS_LABEL: Record<string, string> = {
  pendente: 'Pendente', aprovada: 'Aprovada', reprovada: 'Reprovada',
};

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

export default function RhPage() {
  const [justificativas, setJustificativas] = useState<Justificativa[]>([]);
  const [tipos, setTipos] = useState<TipoOcorrencia[]>([]);
  const [usuarios, setUsuarios] = useState<UsuarioCompleto[]>([]);
  const [anexos, setAnexos] = useState<Record<string, Anexo[]>>({});
  const [loading, setLoading] = useState(true);
  const [filtroStatus, setFiltroStatus] = useState('');
  const [filtroInicio, setFiltroInicio] = useState('');
  const [filtroFim, setFiltroFim] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [lancandoId, setLancandoId] = useState<string | null>(null);
  const [ajustesLancados, setAjustesLancados] = useState<Set<string>>(new Set());
  const [detalheId, setDetalheId] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    setLoading(true);
    try {
      const [j, t, u] = await Promise.all([
        getTodasJustificativas({
          status: filtroStatus || undefined,
          dataInicio: filtroInicio || undefined,
          dataFim: filtroFim || undefined,
        }),
        getTiposOcorrencia(),
        getUsuarios(),
      ]);
      setJustificativas(j);
      setTipos(t);
      setUsuarios(u);
      if (j.length > 0) {
        const mapa = await carregarMapaAnexos(j.map(x => x.id));
        setAnexos(mapa);
      }
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, [filtroStatus, filtroInicio, filtroFim]);

  useEffect(() => { carregar(); }, [carregar]);

  function nomeColaborador(id: string) {
    return usuarios.find(u => u.id === id)?.nome ?? id.slice(0, 8) + '...';
  }

  function nomeAprovador(id?: string) {
    if (!id) return '--';
    return usuarios.find(u => u.id === id)?.nome ?? '--';
  }

  function formatDataHora(d?: string) {
    if (!d) return '--';
    const dt = new Date(d);
    return `${dt.toLocaleDateString('pt-BR')} ${dt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
  }

  async function handleAjuste(id: string) {
    setLancandoId(id);
    try {
      await marcarAjusteLancado(id);
      setAjustesLancados(prev => new Set(prev).add(id));
      setSucesso('Ajuste marcado como lançado com sucesso!');
      setTimeout(() => setSucesso(''), 4000);
    } catch { /* ignore */ }
    finally { setLancandoId(null); }
  }

  const aprovadas  = justificativas.filter(j => j.status === 'aprovada').length;
  const reprovadas = justificativas.filter(j => j.status === 'reprovada').length;
  const pendentes  = justificativas.filter(j => j.status === 'pendente').length;

  return (
    <>
      <div className="page-header">
        <div className="page-title">Todas as Justificativas</div>
        <div className="page-subtitle">Gerencie e marque os ajustes de ponto lançados.</div>
      </div>

      <div className="page-body">
        {sucesso && <div className="alert alert-success mb-4">{sucesso}</div>}

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">{justificativas.length}</div>
            <div className="stat-label">Total encontradas</div>
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
          <div className="filter-bar">
            <select className="form-control" value={filtroStatus} onChange={e => setFiltroStatus(e.target.value)} style={{ minWidth: 140 }}>
              <option value="">Todos os status</option>
              <option value="pendente">Pendente</option>
              <option value="aprovada">Aprovada</option>
              <option value="reprovada">Reprovada</option>
            </select>
            <input type="date" className="form-control" value={filtroInicio} onChange={e => setFiltroInicio(e.target.value)} />
            <input type="date" className="form-control" value={filtroFim} onChange={e => setFiltroFim(e.target.value)} />
            <button className="btn btn-ghost btn-sm" onClick={() => { setFiltroStatus(''); setFiltroInicio(''); setFiltroFim(''); }}>
              Limpar filtros
            </button>
          </div>

          {loading ? (
            <div className="empty-state">
              <span className="spinner" style={{ color: 'var(--blue-600)', width: 32, height: 32 }} />
            </div>
          ) : justificativas.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-title">Nenhum resultado</div>
              <div className="empty-state-text">Tente ajustar os filtros.</div>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Colaborador</th>
                    <th>Motivo</th>
                    <th>Ocorrencia / Horario Correto</th>
                    <th>Status</th>
                    <th>Aprovado por</th>
                    <th>Data/Hora Aprovacao</th>
                    <th>Anexo</th>
                    <th>Acao</th>
                  </tr>
                </thead>
                <tbody>
                  {justificativas.map(j => {
                    const tipo = tipos.find(t => t.id === j.tipoOcorrenciaId);
                    return (
                      <tr key={j.id}>
                        <td className="td-strong">{formatData(j.dataOcorrencia)}</td>
                        <td className="td-strong">{nomeColaborador(j.colaboradorId)}</td>
                        <td>{tipo?.nome ?? '—'}</td>
                        <td>{formatOcorrenciaHorario(j)}</td>
                        <td><span className={`badge badge-${j.status}`}>{STATUS_LABEL[j.status]}</span></td>
                        <td className="td-strong" style={{ fontSize: 13 }}>{nomeAprovador(j.aprovadorId)}</td>
                        <td className="td-muted" style={{ fontSize: 12 }}>{formatDataHora(j.avaliadoEm)}</td>
                        <td><AnexoCell anexos={anexos[j.id] ?? []} /></td>
                        <td>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button className="btn btn-outline btn-sm" onClick={() => setDetalheId(j.id)}>Ver</button>
                            {j.status === 'aprovada' ? (
                              ajustesLancados.has(j.id) ? (
                                <button className="btn btn-sm" disabled style={{ background: 'var(--green-100)', color: 'var(--green-700)', border: '1px solid var(--green-200)', cursor: 'default', fontWeight: 600 }}>
                                  Lancado
                                </button>
                              ) : (
                                <button className="btn btn-ghost btn-sm" onClick={() => handleAjuste(j.id)} disabled={lancandoId === j.id}>
                                  {lancandoId === j.id ? <span className="spinner" /> : 'Lancar ajuste'}
                                </button>
                              )
                            ) : null}
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

      {detalheId && (
        <JustificativaDetalheModal justificativaId={detalheId} onClose={() => setDetalheId(null)} />
      )}
    </>
  );
}
