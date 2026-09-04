/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'

export interface TemplateEntry {
  component: React.ComponentType<any>
  subject: string | ((data: Record<string, any>) => string)
  to?: string
  displayName?: string
  previewData?: Record<string, any>
}

import { template as bookingConfirmation } from './booking-confirmation.tsx'
import { template as bookingConfirmed } from './booking-confirmed.tsx'
import { template as serviceCompleted } from './service-completed.tsx'
import { template as firstBookingWelcome } from './first-booking-welcome.tsx'
import { template as signupWelcome } from './signup-welcome.tsx'
import { template as stylistSignupConfirmation } from './stylist-signup-confirmation.tsx'
import { template as completeSetupReminder } from './complete-setup-reminder.tsx'
import { template as adminBookingAlert } from './admin-booking-alert.tsx'
import { template as newMessageAlert } from './new-message-alert.tsx'

export const TEMPLATES: Record<string, TemplateEntry> = {
  'booking-confirmation': bookingConfirmation,
  'booking-confirmed': bookingConfirmed,
  'service-completed': serviceCompleted,
  'first-booking-welcome': firstBookingWelcome,
  'signup-welcome': signupWelcome,
  'stylist-signup-confirmation': stylistSignupConfirmation,
  'complete-setup-reminder': completeSetupReminder,
  'admin-booking-alert': adminBookingAlert,
}
