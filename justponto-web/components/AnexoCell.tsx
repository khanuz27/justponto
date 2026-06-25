'use client';
import { useState } from 'react';
import { Anexo, getAnexoDownloadUrl } from '@/lib/api';

interface AnexoCellProps {
  anexos: Anexo[];
}

export function AnexoCell({ anexos }: AnexoCellProps) {
  const [baixando, setBaixando] = useState<string | null>(null);

  if (!anexos || anexos.length === 0) {
    return <span className="text-muted">—</span>;
  }

  async function handleDownload(anexo: Anexo) {
    setBaixando(anexo.id);
    try {
      const { url } = await getAnexoDownloadUrl(anexo.id);
      window.open(url, '_blank');
    } catch {
      alert('Não foi possível obter o link de download.');
    } finally {
      setBaixando(null);
    }
  }

  function iconeArquivo(mime: string) {
    if (mime.includes('pdf')) return 'PDF';
    if (mime.includes('image')) return 'IMG';
    return 'ARQ';
  }

  function tamanhoFormatado(bytes: number) {
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {anexos.map(a => (
        <button
          key={a.id}
          onClick={() => handleDownload(a)}
          disabled={baixando === a.id}
          title={`${a.nomeArquivo} (${tamanhoFormatado(a.tamanhoBytes)})`}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: 'none',
            border: '1px solid var(--blue-200)',
            borderRadius: 6,
            padding: '3px 8px',
            cursor: baixando === a.id ? 'wait' : 'pointer',
            fontSize: 12,
            color: 'var(--blue-700)',
            whiteSpace: 'nowrap',
            maxWidth: 160,
            overflow: 'hidden',
          }}
        >
          <span style={{
            fontSize: 9,
            fontWeight: 800,
            background: 'var(--blue-100)',
            color: 'var(--blue-700)',
            padding: '1px 4px',
            borderRadius: 3,
            flexShrink: 0,
          }}>
            {baixando === a.id ? '...' : iconeArquivo(a.tipoMime)}
          </span>
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {a.nomeArquivo}
          </span>
        </button>
      ))}
    </div>
  );
}
