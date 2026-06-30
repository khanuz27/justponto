'use client';
import React, { useState, useEffect, useCallback } from 'react';
import {
  getRelatorioResumo,
  getTodasJustificativas,
  getTiposOcorrencia,
  getUsuarios,
  carregarMapaAnexos,
  RelatorioResumo,
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

export default function DirecaoPage() {
  const [resumo, setResumo] = useState<RelatorioResumo | null>(null);
  const [justificativas, setJustificativas] = useState<Justificativa[]>([]);
  const [tipos, setTipos] = useState<TipoOcorrencia[]>([]);
  const [usuarios, setUsuarios] = useState<UsuarioCompleto[]>([]);
  const [anexos, setAnexos] = useState<Record<string, Anexo[]>>({});
  const [loading, setLoading] = useState(true);
  const [aba, setAba] = useState<'resumo' | 'lista'>('resumo');
  const [detalheId, setDetalheId] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    setLoading(true);
    try {
      const [r, j, t, u] = await Promise.all([
        getRelatorioResumo(),
        getTodasJustificativas(),
        getTiposOcorrencia(),
        getUsuarios(),
      ]);
      setResumo(r);
      setJustificativas(j);
      setTipos(t);
      setUsuarios(u);
      if (j.length > 0) {
        const mapa = await carregarMapaAnexos(j.map(x => x.id));
        setAnexos(mapa);
      }
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, []);

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

  if (loading) return (
    <>
      <div className="page-header">
        <div className="page-title">Painel da Direção</div>
      </div>
      <div className="page-body">
        <div className="empty-state">
          <span className="spinner" style={{ color: 'var(--blue-600)', width: 36, height: 36 }} />
        </div>
      </div>
    </>
  );

  const taxaAprovacao = resumo && resumo.totalGeral > 0
    ? Math.round((resumo.totalPorStatus.aprovada / resumo.totalGeral) * 100)
    : 0;

  return (
    <>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div className="page-title">Painel da Direção</div>
            <div className="page-subtitle">Visão gerencial consolidada de todas as justificativas.</div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={carregar}>Atualizar</button>
        </div>
      </div>

      <div className="page-body">

        {/* Stats */}
        {resumo && (
          <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))' }}>
            <div className="stat-card">
              <div className="stat-value">{resumo.totalGeral}</div>
              <div className="stat-label">Total geral</div>
            </div>
            <div className="stat-card">
              <div className="stat-value" style={{ color: 'var(--amber-600)' }}>{resumo.totalPorStatus.pendente}</div>
              <div className="stat-label">Pendentes</div>
            </div>
            <div className="stat-card">
              <div className="stat-value" style={{ color: 'var(--green-600)' }}>{resumo.totalPorStatus.aprovada}</div>
              <div className="stat-label">Aprovadas</div>
            </div>
            <div className="stat-card">
              <div className="stat-value" style={{ color: 'var(--red-600)' }}>{resumo.totalPorStatus.reprovada}</div>
              <div className="stat-label">Reprovadas</div>
            </div>
            <div className="stat-card">
              <div className="stat-value" style={{ color: 'var(--blue-700)' }}>{taxaAprovacao}%</div>
              <div className="stat-label">Taxa de aprovação</div>
            </div>
          </div>
        )}

        {/* Abas */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 20, borderBottom: '1px solid var(--slate-200)' }}>
          {([['resumo', 'Relatório Analítico'], ['lista', 'Todas as Justificativas']] as const).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setAba(key)}
              style={{
                padding: '10px 18px',
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: 13,
                color: aba === key ? 'var(--blue-700)' : 'var(--slate-500)',
                borderBottom: aba === key ? '2px solid var(--blue-600)' : '2px solid transparent',
                marginBottom: -1,
                transition: 'all 0.15s',
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Aba Resumo */}
        {aba === 'resumo' && resumo && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Ranking de motivos */}
            <div className="card">
              <div className="card-header">
                <span className="card-title">Ranking de Motivos</span>
              </div>
              <div className="card-body">
                {resumo.rankingMotivos.length === 0 ? (
                  <div className="text-muted text-sm">Sem dados</div>
                ) : resumo.rankingMotivos.map((m, i) => {
                  const pct = resumo.totalGeral > 0
                    ? Math.round((m.total / resumo.totalGeral) * 100)
                    : 0;
                  return (
                    <div key={m.tipoId} style={{ marginBottom: 14 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontWeight: 500, color: 'var(--slate-700)', fontSize: 13 }}>
                          <span style={{ color: 'var(--slate-400)', marginRight: 6 }}>#{i + 1}</span>
                          {m.nome}
                        </span>
                        <span style={{ fontWeight: 700, color: 'var(--slate-800)', fontSize: 13 }}>
                          {m.total}{' '}
                          <span style={{ color: 'var(--slate-400)', fontWeight: 400 }}>({pct}%)</span>
                        </span>
                      </div>
                      <div className="progress-bar">
                        <div
                          className="progress-fill"
                          style={{
                            width: `${pct}%`,
                            background: `hsl(${220 - i * 20}, 70%, ${50 + i * 4}%)`,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Por colaborador */}
            <div className="card">
              <div className="card-header">
                <span className="card-title">Por Colaborador</span>
              </div>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Colaborador</th>
                      <th>Total</th>
                      <th>Pendentes</th>
                      <th>Aprovadas</th>
                      <th>Reprovadas</th>
                      <th>Dias justificados</th>
                      <th>Horas justificadas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resumo.porColaborador.map((c, i) => (
                      <tr key={i}>
                        <td className="td-strong">{c.nome}</td>
                        <td>{c.total}</td>
                        <td><span className="badge badge-pendente">{c.pendentes}</span></td>
                        <td><span className="badge badge-aprovada">{c.aprovadas}</span></td>
                        <td><span className="badge badge-reprovada">{c.reprovadas}</span></td>
                        <td style={{ fontWeight: 600 }}>{c.diasJustificados.toFixed(1)}d</td>
                        <td style={{ fontWeight: 600, color: 'var(--blue-700)' }}>{c.horasJustificadas.toFixed(1)}h</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Aba Lista */}
        {aba === 'lista' && (
          <div className="card">
            <div className="card-header">
              <span className="card-title">Todas as Justificativas ({justificativas.length})</span>
            </div>
            {justificativas.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-title">Sem registros</div>
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
                            <button className="btn btn-outline btn-sm" onClick={() => setDetalheId(j.id)}>Ver</button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {detalheId && (
        <JustificativaDetalheModal justificativaId={detalheId} onClose={() => setDetalheId(null)} />
      )}
    </>
  );
}
