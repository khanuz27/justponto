import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ConfigService } from '@nestjs/config';

export function createSupabaseClient(config: ConfigService): SupabaseClient {
  const url = config.get<string>('SUPABASE_URL');
  const key = config.get<string>('SUPABASE_SERVICE_ROLE_KEY');
  if (!url || !key) {
    throw new Error('SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórios quando DATA_SOURCE=supabase');
  }
  return createClient(url, key, { auth: { persistSession: false } });
}
