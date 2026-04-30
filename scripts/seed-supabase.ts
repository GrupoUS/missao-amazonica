#!/usr/bin/env bun
/**
 * Idempotent seed runner via Supabase JS client (service role).
 * Inserts mission + categories + sample items + settings.
 */

import { createClient } from '@supabase/supabase-js';
import type { Database } from '../src/lib/supabase/types';

function decodeJwtRef(jwt: string): string | null {
  const parts = jwt.split('.');
  if (parts.length !== 3) return null;
  try {
    const payload = JSON.parse(
      Buffer.from(parts[1]!.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8'),
    );
    return typeof payload?.ref === 'string' ? payload.ref : null;
  } catch {
    return null;
  }
}

const ANON = process.env.PUBLIC_SUPABASE_ANON_KEY ?? '';
const SVC = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';
let URL = process.env.PUBLIC_SUPABASE_URL ?? '';

if (!URL) {
  const ref = decodeJwtRef(ANON || SVC);
  if (ref) URL = `https://${ref}.supabase.co`;
}

if (!URL || !SVC) {
  console.error('Missing PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

const sb = createClient<Database>(URL, SVC, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function seedMissions() {
  const { error } = await sb.from('missions').upsert(
    {
      id: '00000000-0000-0000-0000-00000000aaaa',
      title: 'Missão Amazônica – Sal da Terra',
      slug: 'sal-da-terra',
      description:
        'Levando esperança, saúde e dignidade para comunidades ribeirinhas do Rio Negro através de ações concretas e transparentes a cada abril.',
      region: 'Comunidades ribeirinhas do Rio Negro, Amazonas',
      mission_month: 'Abril',
      mission_duration_days: 7,
      is_active: true,
    },
    { onConflict: 'id' },
  );
  if (error) throw error;
  console.log('✓ mission seeded');
}

async function seedCategories() {
  const cats = [
    { id: '00000000-0000-0000-0000-00000001cccc', name: 'Saúde', slug: 'saude', description: 'Atendimento médico, suprimentos, kits e expedições do barco hospital.', sort_order: 1 },
    { id: '00000000-0000-0000-0000-00000002cccc', name: 'Alimentação', slug: 'alimentacao', description: 'Cestas básicas, segurança alimentar e logística de distribuição.', sort_order: 2 },
    { id: '00000000-0000-0000-0000-00000003cccc', name: 'Educação', slug: 'educacao', description: 'Materiais didáticos, infraestrutura escolar e formação local.', sort_order: 3 },
    { id: '00000000-0000-0000-0000-00000004cccc', name: 'Infraestrutura', slug: 'infraestrutura', description: 'Filtros de água, sistemas de energia e moradia.', sort_order: 4 },
    { id: '00000000-0000-0000-0000-00000005cccc', name: 'Logística', slug: 'logistica', description: 'Combustível, transporte fluvial e suporte a expedições.', sort_order: 5 },
    { id: '00000000-0000-0000-0000-00000006cccc', name: 'Comunidade', slug: 'comunidade', description: 'Apoio comunitário, formação de líderes e iniciativas pastorais.', sort_order: 6 },
  ];
  const { error } = await sb.from('categories').upsert(cats, { onConflict: 'id' });
  if (error) throw error;
  console.log(`✓ ${cats.length} categories seeded`);
}

async function seedItems() {
  const items = [
    {
      id: '00000000-0000-0000-0000-0000000010aa',
      mission_id: '00000000-0000-0000-0000-00000000aaaa',
      category_id: '00000000-0000-0000-0000-00000004cccc',
      title: 'Filtros de Água para São Gabriel',
      slug: 'filtros-de-agua-sao-gabriel',
      description:
        'Garantir água potável para 5 comunidades ribeirinhas com 50 sistemas de filtragem comunitários, prevenindo doenças hídricas que afetam especialmente as crianças durante o período de cheia do Rio Negro.',
      image_url: null,
      image_type: 'illustrative' as const,
      urgency: 'urgent' as const,
      target_amount_cents: 500000,
      status: 'published' as const,
      sort_order: 10,
    },
    {
      id: '00000000-0000-0000-0000-0000000011aa',
      mission_id: '00000000-0000-0000-0000-00000000aaaa',
      category_id: '00000000-0000-0000-0000-00000001cccc',
      title: 'Kits de Primeiros Socorros',
      slug: 'kits-de-primeiros-socorros',
      description:
        'Suprimentos básicos para atendimento inicial em áreas isoladas: medicamentos essenciais, materiais de curativo e equipamentos de diagnóstico portátil.',
      image_url: null,
      image_type: 'illustrative' as const,
      urgency: 'high' as const,
      target_amount_cents: 300000,
      status: 'published' as const,
      sort_order: 20,
    },
    {
      id: '00000000-0000-0000-0000-0000000012aa',
      mission_id: '00000000-0000-0000-0000-00000000aaaa',
      category_id: '00000000-0000-0000-0000-00000003cccc',
      title: 'Material Escolar 2026',
      slug: 'material-escolar-2026',
      description:
        'Kits educacionais completos para crianças iniciarem o ano letivo preparadas: cadernos, lápis, mochilas e livros didáticos para 200 alunos da escola rural.',
      image_url: '/images/items/material-escolar.jpg',
      image_type: 'real' as const,
      urgency: 'medium' as const,
      target_amount_cents: 400000,
      status: 'published' as const,
      sort_order: 30,
    },
    {
      id: '00000000-0000-0000-0000-0000000013aa',
      mission_id: '00000000-0000-0000-0000-00000000aaaa',
      category_id: '00000000-0000-0000-0000-00000002cccc',
      title: 'Cestas Básicas Mensais',
      slug: 'cestas-basicas-mensais',
      description:
        'Garantia de segurança alimentar para 200 famílias cadastradas durante o período de cheia dos rios, com cestas mensais entregues por equipe local.',
      image_url: null,
      image_type: 'illustrative' as const,
      urgency: 'medium' as const,
      target_amount_cents: 3000000,
      status: 'published' as const,
      sort_order: 40,
    },
    {
      id: '00000000-0000-0000-0000-0000000014aa',
      mission_id: '00000000-0000-0000-0000-00000000aaaa',
      category_id: '00000000-0000-0000-0000-00000001cccc',
      title: 'Barco Hospital Sal da Terra',
      slug: 'barco-hospital-sal-da-terra',
      description:
        'Combustível e suprimentos médicos para expedição de 15 dias atendendo 4 comunidades isoladas no Rio Solimões. Inclui consultas, exames e atendimento odontológico.',
      image_url: '/images/items/barco-hospital.jpg',
      image_type: 'real' as const,
      urgency: 'urgent' as const,
      target_amount_cents: 5000000,
      status: 'published' as const,
      sort_order: 5,
    },
    {
      id: '00000000-0000-0000-0000-0000000015aa',
      mission_id: '00000000-0000-0000-0000-00000000aaaa',
      category_id: '00000000-0000-0000-0000-00000004cccc',
      title: 'Placas Solares Portáteis',
      slug: 'placas-solares-portateis',
      description:
        'Energia solar portátil para atender comunidades sem acesso à rede elétrica, viabilizando refrigeração de medicamentos, iluminação noturna e estudo das crianças.',
      image_url: null,
      image_type: 'illustrative' as const,
      urgency: 'high' as const,
      target_amount_cents: 1500000,
      status: 'published' as const,
      sort_order: 25,
    },
  ];
  const { error } = await sb.from('donation_items').upsert(items, { onConflict: 'id' });
  if (error) throw error;
  console.log(`✓ ${items.length} donation_items seeded`);
}

async function seedSettings() {
  const settings = [
    { key: 'mission_text', value: 'Acreditamos que a fé genuína se manifesta através do serviço ao próximo. Trabalhamos em parceria com líderes locais para identificar as necessidades mais urgentes das comunidades ribeirinhas do Rio Negro.', is_public: true },
    { key: 'mission_period', value: 'Toda primeira semana de abril, anualmente.', is_public: true },
    { key: 'contact_email', value: null, is_public: true },
    { key: 'social_links', value: { instagram: null, facebook: null, youtube: null }, is_public: true },
    { key: 'cnpj', value: null, is_public: true },
    { key: 'pix_key', value: '', is_public: false },
    { key: 'pix_merchant_name', value: 'MISSAO AMAZONICA', is_public: false },
    { key: 'pix_merchant_city', value: 'MANAUS', is_public: false },
    { key: 'bank_status', value: 'not_configured', is_public: false },
    { key: 'bank_name', value: '', is_public: false },
  ];
  const { error } = await sb.from('settings').upsert(settings, { onConflict: 'key' });
  if (error) throw error;
  console.log(`✓ ${settings.length} settings seeded`);
}

async function main() {
  console.log(`▸ Seeding ${URL} …`);
  await seedMissions();
  await seedCategories();
  await seedItems();
  await seedSettings();
  console.log('✓ seed complete');
}

await main().catch((e) => {
  console.error('Fatal:', e?.message ?? e);
  process.exit(1);
});
