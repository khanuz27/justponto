'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';

export default function Home() {
  const { usuario, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!usuario) { router.replace('/login'); return; }
    router.replace(`/dashboard/${usuario.perfil}`);
  }, [usuario, loading, router]);

  return (
    <div className="loading-screen">
      <span className="spinner" style={{ color: 'var(--blue-600)' }} />
      Carregando...
    </div>
  );
}
