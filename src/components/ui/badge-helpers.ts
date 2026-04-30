import type { Urgency, ItemStatus, AccountabilityStatus, IntentStatus } from '@/lib/supabase/aliases';

type Tone = 'urgent' | 'high' | 'medium' | 'low' | 'success' | 'neutral' | 'category' | 'info';

export function urgencyToTone(u: Urgency): Tone {
  switch (u) {
    case 'urgent':
      return 'urgent';
    case 'high':
      return 'high';
    case 'medium':
      return 'medium';
    case 'low':
      return 'low';
    default:
      return 'neutral';
  }
}

export function urgencyLabel(u: Urgency): string {
  return { urgent: 'Urgente', high: 'Alta', medium: 'Média', low: 'Baixa' }[u];
}

export function itemStatusToTone(s: ItemStatus): Tone {
  switch (s) {
    case 'published':
      return 'success';
    case 'completed':
      return 'info';
    case 'archived':
      return 'neutral';
    default:
      return 'neutral';
  }
}

export function itemStatusLabel(s: ItemStatus): string {
  return { draft: 'Rascunho', published: 'Publicado', archived: 'Arquivado', completed: 'Concluído' }[s];
}

export function accountabilityToTone(s: AccountabilityStatus): Tone {
  switch (s) {
    case 'completed':
      return 'success';
    case 'delivered':
      return 'success';
    case 'purchased':
      return 'info';
    case 'planned':
      return 'neutral';
    default:
      return 'neutral';
  }
}

export function accountabilityLabel(s: AccountabilityStatus): string {
  return {
    planned: 'Planejado',
    purchased: 'Comprado',
    delivered: 'Entregue',
    completed: 'Concluído',
  }[s];
}

export function intentStatusToTone(s: IntentStatus): Tone {
  switch (s) {
    case 'confirmed':
      return 'success';
    case 'pending':
      return 'high';
    case 'expired':
    case 'cancelled':
    case 'failed':
      return 'urgent';
    default:
      return 'neutral';
  }
}

export function intentStatusLabel(s: IntentStatus): string {
  return {
    pending: 'Pendente',
    confirmed: 'Confirmada',
    expired: 'Expirada',
    cancelled: 'Cancelada',
    failed: 'Falhou',
  }[s];
}
