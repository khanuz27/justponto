'use client';
import { useState, useEffect, useCallback } from 'react';
import {
  getTodasJustificativas,
  getTiposOcorrencia,
  marcarAjusteLancado,
  Justificativa,
  TipoOcorrencia,
} from '@/lib/api';

function formatData(d: string) {
  if (!d) return '—';
  const [y, m, day] = d.split('T')[0].split('-');
  return `${day}/${m}/${y}`;
}

const STATUS_LABEL: Record<string, string> = {
  pendente: 'Pendente', aprovada: 'Aprovada', reprovada: 'Reprovada',
};

export default function RhPage() {
  const [justificativas, setJustificativas] = useState<Justificativa[]>([]);
  const [tipos, setTipos] = useState<TipoOcorrencia[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroStatus, setFiltroStatus] = useState('');
  const [filtroInicio, setFiltroInicio] = useState('');
  const [filtroFim, setFiltroFim] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [lancandoId, setLancandoId] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    setLoading(true);
    try {
      const [j, t] = await Promise.all([
        getTodasJustificativas({ status: filtroStatus || undefined, dataInicio: filtroInicio || undefined, dataFim: filtroFim || undefined }),
        getTiposOcorrencia(),
      ]);
      setJustificativas(j);
      setTipos(t);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, [filtroStatus, filtroInicio, filtroFim]);

  useEffect(() => { carregar(); }, [carregar]);

  async function handleAjuste(id: string) {
    setLancandoId(id);
    try {
      await marcarAjusteLancado(id);
      setSucesso('Ajuste marcado como lançado!');
      setTimeout(() => setSucesso(''), 4000);
      carregar();
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
            <div className="stat-icon" style={{ background: 'var(--slate-100)' }}>📁</div>
            <div className="stat-value">{justificativas.length}</div>
            <div className="stat-label">Total encontradas</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'var(--amber-100)' }}>⏳</div>
            <div className="stat-value" style={{ color: 'var(--amber-600)' }}>{pendentes}</div>
            <div className="stat-label">Pendentes</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'var(--green-100)' }}>✅</div>
            <div className="stat-value" style={{ color: 'var(--green-600)' }}>{aprovadas}</div>
            <div className="stat-label">Aprovadas</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'var(--red-100)' }}>❌</div>
            <div className="stat-value" style={{ color: 'var(--red-600)' }}>{reprovadas}</div>
            <div className="stat-label">Reprovadas</div>
          </div>
        </div>

        <div className="card">
          {/* Filtros */}
          <div className="filter-bar">
            <select className="form-control" value={filtroStatus} onChange={e => setFiltroStatus(e.target.value)} style={{ minWidth: 140 }}>
              <option value="">Todos os status</option>
              <option value="pendente">Pendente</option>
              <option value="aprovada">Aprovada</option>
              <option value="reprovada">Reprovada</option>
            </select>
            <input type="date" className="form-control" value={filtroInicio} onChange={e => setFiltroInicio(e.target.value)} placeholder="Data início" />
            <input type="date" className="form-control" value={filtroFim} onChange={e => setFiltroFim(e.target.value)} placeholder="Data fim" />
            <button className="btn btn-ghost btn-sm" onClick={() => { setFiltroStatus(''); setFiltroInicio(''); setFiltroFim(''); }}>
              Limpar
            </button>
          </div>

          {loading ? (
            <div className="empty-state">
              <span className="spinner" style={{ color: 'var(--blue-600)', width: 32, height: 32 }} />
            </div>
          ) : justificativas.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🔍</div>
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
                    <th>Período</th>
                    <th>Status</th>
                    <th>Avaliado em</th>
                    <th>Comentário</th>
                    <th>Ação RH</th>
                  </tr>
                </thead>
                <tbody>
                  {justificativas.map(j => {
                    const tipo = tipos.find(t => t.id === j.tipoOcorrenciaId);
                    return (
                      <tr key={j.id}>
                        <td className="td-strong">{formatData(j.dataOcorrencia)}</td>
                        <td className="td-muted" style={{ fontFamily: 'monospace' }}>{j.colaboradorId.slice(0, 8)}…</td>
                        <td>{tipo?.nome ?? '—'}</td>
                        <td>{j.periodo === 'dia_inteiro' ? 'Dia inteiro' : `${j.horaInicio} – ${j.horaFim}`}</td>
                        <td><span className={`badge badge-${j.status}`}>{STATUS_LABEL[j.status]}</span></td>
                        <td className="td-muted">{j.avaliadoEm ? formatData(j.avaliadoEm) : '—'}</td>
                        <td style={{ maxWidth: 160 }}>
                          {j.comentarioAvaliacao
                            ? <span title={j.comentarioAvaliacao} style={{ cursor: 'help', textDecoration: 'underline dotted', color: 'var(--slate-500)', fontSize: 12 }}>Ver</span>
                            : <span className="text-muted">—</span>}
                        </td>
                        <td>
                          {j.status === 'aprovada' ? (
                            <button
                              className="btn btn-ghost btn-sm"
                              onClick={() => handleAjuste(j.id)}
                              disabled={lancandoId === j.id}
                            >
                              {lancandoId === j.id ? <span className="spinner" /> : '🗂 Lançar'}
                            </button>
                          ) : <span className="text-muted">—</span>}
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
    </>
  );
}
