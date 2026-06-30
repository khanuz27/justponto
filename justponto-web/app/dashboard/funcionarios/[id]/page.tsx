'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  getUsuarios,
  getTodasJustificativas,
  getTiposOcorrencia,
  carregarMapaAnexos,
  UsuarioCompleto,
  Justificativa,
  TipoOcorrencia,
  Anexo,
} from '@/lib/api';
import { AnexoCell } from '@/components/AnexoCell';

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

function calcKpis(lista: Justificativa[]) {
  let diasInteiros = 0;
  let minutosParciais = 0;
  lista.filter(j => j.status === 'aprovada').forEach(j => {
    if (j.periodo === 'dia_inteiro') {
      diasInteiros += 1;
    } else if (j.horaInicio && j.horaFim) {
      const [h1, m1] = j.horaInicio.split(':').map(Number);
      const [h2, m2] = j.horaFim.split(':').map(Number);
      minutosParciais += (h2 * 60 + m2) - (h1 * 60 + m1);
    }
  });
  const horasAprovadas = (diasInteiros * 8) + (minutosParciais / 60);
  const diasJustificados = diasInteiros + minutosParciais / 480;
  return {
    total: lista.length,
    pendentes: lista.filter(j => j.status === 'pendente').length,
    aprovadas: lista.filter(j => j.status === 'aprovada').length,
    reprovadas: lista.filter(j => j.status === 'reprovada').length,
    taxaAprovacao: lista.length > 0 ? Math.round((lista.filter(j => j.status === 'aprovada').length / lista.length) * 100) : 0,
    horasAprovadas: horasAprovadas.toFixed(1),
    diasJustificados: diasJustificados.toFixed(1),
  };
}

export default function FuncionarioDetalhe() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [funcionario, setFuncionario] = useState<UsuarioCompleto | null>(null);
  const [todasJust, setTodasJust] = useState<Justificativa[]>([]);
  const [tipos, setTipos] = useState<TipoOcorrencia[]>([]);
  const [anexos, setAnexos] = useState<Record<string, Anexo[]>>({});
  const [loading, setLoading] = useState(true);

  const [filtroStatus, setFiltroStatus] = useState('');
  const [filtroInicio, setFiltroInicio] = useState('');
  const [filtroFim, setFiltroFim] = useState('');

  const carregar = useCallback(async () => {
    setLoading(true);
    try {
      const [usuarios, justificativas, tiposData] = await Promise.all([
        getUsuarios(),
        getTodasJustificativas(),
        getTiposOcorrencia(),
      ]);
      const found = usuarios.find(u => u.id === id) ?? null;
      const mine = justificativas.filter(j => j.colaboradorId === id);
      setFuncionario(found);
      setTodasJust(mine);
      setTipos(tiposData);
      if (mine.length > 0) {
        const mapa = await carregarMapaAnexos(mine.map(x => x.id));
        setAnexos(mapa);
      }
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, [id]);

  useEffect(() => { carregar(); }, [carregar]);

  const justificativas = todasJust.filter(j => {
    if (filtroStatus && j.status !== filtroStatus) return false;
    if (filtroInicio && j.dataOcorrencia.split('T')[0] < filtroInicio) return false;
    if (filtroFim && j.dataOcorrencia.split('T')[0] > filtroFim) return false;
    return true;
  });

  const kpis = calcKpis(justificativas);
  const kpisGeral = calcKpis(todasJust);

  if (loading) return (
    <>
      <div className="page-header"><div className="page-title">Carregando...</div></div>
      <div className="page-body"><div className="empty-state"><span className="spinner" style={{ color: 'var(--blue-600)', width: 36, height: 36 }} /></div></div>
    </>
  );

  if (!funcionario) return (
    <>
      <div className="page-header"><div className="page-title">Funcionário não encontrado</div></div>
      <div className="page-body"><button className="btn btn-outline" onClick={() => router.back()}>Voltar</button></div>
    </>
  );

  return (
    <>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button className="btn btn-ghost btn-sm" onClick={() => router.push('/dashboard/funcionarios')} style={{ padding: '6px 12px' }}>
            ← Funcionários
          </button>
          <div>
            <div className="page-title">{funcionario.nome}</div>
            <div className="page-subtitle">{funcionario.email}</div>
          </div>
        </div>
      </div>

      <div className="page-body">
        {/* KPIs gerais */}
        <div style={{ marginBottom: 8 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--slate-400)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 10 }}>
            Visão geral do funcionário
          </div>
          <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))' }}>
            {[
              { label: 'Total de justificativas', value: kpisGeral.total, color: 'var(--slate-800)' },
              { label: 'Pendentes', value: kpisGeral.pendentes, color: 'var(--amber-600)' },
              { label: 'Aprovadas', value: kpisGeral.aprovadas, color: 'var(--green-600)' },
              { label: 'Reprovadas', value: kpisGeral.reprovadas, color: 'var(--red-600)' },
              { label: 'Taxa de aprovação', value: `${kpisGeral.taxaAprovacao}%`, color: 'var(--blue-700)' },
              { label: 'Horas justificadas', value: `${kpisGeral.horasAprovadas}h`, color: 'var(--blue-700)' },
              { label: 'Dias justificados', value: `${kpisGeral.diasJustificados}d`, color: 'var(--blue-700)' },
            ].map(k => (
              <div key={k.label} className="stat-card">
                <div className="stat-value" style={{ color: k.color }}>{k.value}</div>
                <div className="stat-label">{k.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div style={{ padding: '16px 20px 0' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--slate-700)', marginBottom: 12 }}>
              Justificativas
              <span style={{ fontWeight: 400, color: 'var(--slate-400)', marginLeft: 8 }}>
                {justificativas.length} registro{justificativas.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          <div className="filter-bar">
            <select className="form-control" value={filtroStatus} onChange={e => setFiltroStatus(e.target.value)} style={{ minWidth: 140 }}>
              <option value="">Todos os status</option>
              <option value="pendente">Pendente</option>
              <option value="aprovada">Aprovada</option>
              <option value="reprovada">Reprovada</option>
            </select>
            <input type="date" className="form-control" value={filtroInicio} onChange={e => setFiltroInicio(e.target.value)} title="Data início" />
            <input type="date" className="form-control" value={filtroFim} onChange={e => setFiltroFim(e.target.value)} title="Data fim" />
            <button className="btn btn-ghost btn-sm" onClick={() => { setFiltroStatus(''); setFiltroInicio(''); setFiltroFim(''); }}>
              Limpar filtros
            </button>
          </div>

          {/* KPIs do período filtrado */}
          {(filtroStatus || filtroInicio || filtroFim) && (
            <div style={{ padding: '12px 20px', background: 'var(--blue-50)', borderBottom: '1px solid var(--blue-100)' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--blue-600)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>
                KPIs do período filtrado
              </div>
              <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                {[
                  { label: 'Registros', value: kpis.total, color: 'var(--slate-800)' },
                  { label: 'Aprovadas', value: kpis.aprovadas, color: 'var(--green-700)' },
                  { label: 'Pendentes', value: kpis.pendentes, color: 'var(--amber-700)' },
                  { label: 'Reprovadas', value: kpis.reprovadas, color: 'var(--red-700)' },
                  { label: 'Horas justificadas', value: `${kpis.horasAprovadas}h`, color: 'var(--blue-700)' },
                  { label: 'Dias justificados', value: `${kpis.diasJustificados}d`, color: 'var(--blue-700)' },
                  { label: 'Taxa aprovação', value: `${kpis.taxaAprovacao}%`, color: 'var(--blue-700)' },
                ].map(k => (
                  <div key={k.label} style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 20, fontWeight: 800, color: k.color }}>{k.value}</div>
                    <div style={{ fontSize: 11, color: 'var(--slate-500)' }}>{k.label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {justificativas.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-title">Nenhuma justificativa encontrada</div>
              <div className="empty-state-text">
                {filtroStatus || filtroInicio || filtroFim ? 'Tente ajustar os filtros.' : 'Este funcionário ainda não registrou justificativas.'}
              </div>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Data da ocorrência</th>
                    <th>Motivo</th>
                    <th>Horario Correto</th>
                    <th>Descrição</th>
                    <th>Status</th>
                    <th>Avaliado em</th>
                    <th>Anexo</th>
                    <th>Observações Gerência</th>
                  </tr>
                </thead>
                <tbody>
                  {justificativas.map(j => {
                    const tipo = tipos.find(t => t.id === j.tipoOcorrenciaId);
                    return (
                      <React.Fragment key={j.id}>
                        <tr>
                          <td className="td-strong">{formatData(j.dataOcorrencia)}</td>
                          <td>{tipo?.nome ?? '—'}</td>
                          <td>{formatOcorrenciaHorario(j)}</td>
                          <td style={{ maxWidth: 200 }}>
                            <span title={j.descricao} style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {j.descricao}
                            </span>
                          </td>
                          <td><span className={`badge badge-${j.status}`}>{STATUS_LABEL[j.status]}</span></td>
                          <td className="td-muted">{j.avaliadoEm ? formatData(j.avaliadoEm) : '—'}</td>
                          <td><AnexoCell anexos={anexos[j.id] ?? []} /></td>
                          <td style={{ maxWidth: 200, color: j.comentarioAvaliacao ? 'var(--slate-700)' : 'var(--slate-400)', fontSize: 13 }}>
                            <span title={j.comentarioAvaliacao ?? ''} style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {j.comentarioAvaliacao ?? '—'}
                            </span>
                          </td>
                        </tr>
                      </React.Fragment>
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
