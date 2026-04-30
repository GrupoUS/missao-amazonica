-- ─────────────────────────────────────────────────────────────────────────────
-- Seed · Mission, categories, sample items, settings.
-- Idempotent: safe to re-run.
-- ─────────────────────────────────────────────────────────────────────────────

-- ─── Mission ────────────────────────────────────────────────────────────────
insert into public.missions (id, title, slug, description, region, mission_month, mission_duration_days, is_active)
values (
  '00000000-0000-0000-0000-00000000aaaa',
  'Missão Amazônica – Sal da Terra',
  'sal-da-terra',
  'Levando esperança, saúde e dignidade para comunidades ribeirinhas do Rio Negro através de ações concretas e transparentes a cada abril.',
  'Comunidades ribeirinhas do Rio Negro, Amazonas',
  'Abril',
  7,
  true
)
on conflict (id) do update set
  title = excluded.title,
  description = excluded.description,
  region = excluded.region,
  is_active = excluded.is_active,
  updated_at = now();

-- ─── Categories ────────────────────────────────────────────────────────────
insert into public.categories (id, name, slug, description, sort_order) values
  ('00000000-0000-0000-0000-00000001cccc', 'Saúde',           'saude',          'Atendimento médico, suprimentos, kits e expedições do barco hospital.', 1),
  ('00000000-0000-0000-0000-00000002cccc', 'Alimentação',     'alimentacao',    'Cestas básicas, segurança alimentar e logística de distribuição.',     2),
  ('00000000-0000-0000-0000-00000003cccc', 'Educação',        'educacao',       'Materiais didáticos, infraestrutura escolar e formação local.',        3),
  ('00000000-0000-0000-0000-00000004cccc', 'Infraestrutura',  'infraestrutura', 'Filtros de água, sistemas de energia e moradia.',                      4),
  ('00000000-0000-0000-0000-00000005cccc', 'Logística',       'logistica',      'Combustível, transporte fluvial e suporte a expedições.',              5),
  ('00000000-0000-0000-0000-00000006cccc', 'Comunidade',      'comunidade',     'Apoio comunitário, formação de líderes e iniciativas pastorais.',      6)
on conflict (id) do update set
  name = excluded.name,
  description = excluded.description,
  sort_order = excluded.sort_order;

-- ─── Sample donation items (matches mockups) ──────────────────────────────────
insert into public.donation_items (
  id, mission_id, category_id, title, slug, description,
  image_url, image_type, urgency, target_amount_cents, status, sort_order
) values
  (
    '00000000-0000-0000-0000-0000000010aa',
    '00000000-0000-0000-0000-00000000aaaa',
    '00000000-0000-0000-0000-00000004cccc',
    'Filtros de Água para São Gabriel',
    'filtros-de-agua-sao-gabriel',
    'Garantir água potável para 5 comunidades ribeirinhas com 50 sistemas de filtragem comunitários, prevenindo doenças hídricas que afetam especialmente as crianças durante o período de cheia do Rio Negro.',
    null,
    'illustrative',
    'urgent',
    500000,
    'published',
    10
  ),
  (
    '00000000-0000-0000-0000-0000000011aa',
    '00000000-0000-0000-0000-00000000aaaa',
    '00000000-0000-0000-0000-00000001cccc',
    'Kits de Primeiros Socorros',
    'kits-de-primeiros-socorros',
    'Suprimentos básicos para atendimento inicial em áreas isoladas: medicamentos essenciais, materiais de curativo e equipamentos de diagnóstico portátil.',
    null,
    'illustrative',
    'high',
    300000,
    'published',
    20
  ),
  (
    '00000000-0000-0000-0000-0000000012aa',
    '00000000-0000-0000-0000-00000000aaaa',
    '00000000-0000-0000-0000-00000003cccc',
    'Material Escolar 2026',
    'material-escolar-2026',
    'Kits educacionais completos para crianças iniciarem o ano letivo preparadas: cadernos, lápis, mochilas e livros didáticos para 200 alunos da escola rural.',
    null,
    'illustrative',
    'medium',
    400000,
    'published',
    30
  ),
  (
    '00000000-0000-0000-0000-0000000013aa',
    '00000000-0000-0000-0000-00000000aaaa',
    '00000000-0000-0000-0000-00000002cccc',
    'Cestas Básicas Mensais',
    'cestas-basicas-mensais',
    'Garantia de segurança alimentar para 200 famílias cadastradas durante o período de cheia dos rios, com cestas mensais entregues por equipe local.',
    null,
    'illustrative',
    'medium',
    3000000,
    'published',
    40
  ),
  (
    '00000000-0000-0000-0000-0000000014aa',
    '00000000-0000-0000-0000-00000000aaaa',
    '00000000-0000-0000-0000-00000001cccc',
    'Barco Hospital Sal da Terra',
    'barco-hospital-sal-da-terra',
    'Combustível e suprimentos médicos para expedição de 15 dias atendendo 4 comunidades isoladas no Rio Solimões. Inclui consultas, exames e atendimento odontológico.',
    null,
    'illustrative',
    'urgent',
    5000000,
    'published',
    5
  ),
  (
    '00000000-0000-0000-0000-0000000015aa',
    '00000000-0000-0000-0000-00000000aaaa',
    '00000000-0000-0000-0000-00000004cccc',
    'Placas Solares Portáteis',
    'placas-solares-portateis',
    'Energia solar portátil para atender comunidades sem acesso à rede elétrica, viabilizando refrigeração de medicamentos, iluminação noturna e estudo das crianças.',
    null,
    'illustrative',
    'high',
    1500000,
    'published',
    25
  )
on conflict (id) do update set
  title = excluded.title,
  description = excluded.description,
  urgency = excluded.urgency,
  target_amount_cents = excluded.target_amount_cents,
  status = excluded.status,
  sort_order = excluded.sort_order,
  updated_at = now();

-- ─── Settings (defaults) ────────────────────────────────────────────────────
insert into public.settings (key, value, is_public) values
  ('mission_text', '"Acreditamos que a fé genuína se manifesta através do serviço ao próximo. Trabalhamos em parceria com líderes locais para identificar as necessidades mais urgentes das comunidades ribeirinhas do Rio Negro."'::jsonb, true),
  ('mission_period', '"Toda primeira semana de abril, anualmente."'::jsonb, true),
  ('contact_email', '"contato@missaoamazonica.org"'::jsonb, true),
  ('social_links', '{"instagram": null, "facebook": null, "youtube": null}'::jsonb, true),
  ('cnpj', '"00.000.000/0001-00"'::jsonb, true),
  ('pix_key', '""'::jsonb, false),
  ('pix_merchant_name', '"MISSAO AMAZONICA"'::jsonb, false),
  ('pix_merchant_city', '"MANAUS"'::jsonb, false),
  ('bank_status', '"not_configured"'::jsonb, false),
  ('bank_name', '""'::jsonb, false)
on conflict (key) do update set
  value = excluded.value,
  is_public = excluded.is_public,
  updated_at = now();
