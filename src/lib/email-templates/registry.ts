import type { ComponentType } from 'react'
import { template as bookingConfirmationTemplate } from './booking-confirmation'
import { template as hostProposalReceivedTemplate } from './host-proposal-received'
import { template as adminNewProposalAlertTemplate } from './admin-new-proposal-alert'

export interface TemplateEntry {
  component: ComponentType<any>
  subject: string | ((data: Record<string, any>) => string)
  displayName?: string
  previewData?: Record<string, any>
  /** Fixed recipient — overrides caller-provided recipientEmail when set. */
  to?: string
}

/**
 * Template registry — maps template names to their React Email components.
 * Import and register new templates here after creating them in this directory.
 */
export const TEMPLATES: Record<string, TemplateEntry> = {
  'booking-confirmation': bookingConfirmationTemplate,
  'host-proposal-received': hostProposalReceivedTemplate,
  'admin-new-proposal-alert': adminNewProposalAlertTemplate,
}
