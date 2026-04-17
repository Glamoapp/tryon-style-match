/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = 'NextLook Beauty'
const LOGO_URL = 'https://wmumnlhzjvscoyuqljyj.supabase.co/storage/v1/object/public/email-assets/logo.png'

interface AdminBookingAlertProps {
  customerName?: string
  customerEmail?: string
  customerPhone?: string
  customerAddress?: string
  stylistName?: string
  serviceName?: string
  bookingDate?: string
  bookingTime?: string
  totalPrice?: string
  bookingId?: string
}

const AdminBookingAlertEmail = ({
  customerName,
  customerEmail,
  customerPhone,
  customerAddress,
  stylistName,
  serviceName,
  bookingDate,
  bookingTime,
  totalPrice,
  bookingId,
}: AdminBookingAlertProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>New booking: {serviceName || 'Service'} for {customerName || 'a customer'}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Img src={LOGO_URL} alt={SITE_NAME} width="140" height="auto" style={logo} />

        <Heading style={h1}>📋 New Booking Alert</Heading>

        <Text style={text}>
          A new booking just came in on {SITE_NAME}.
        </Text>

        <Section style={detailsBox}>
          <Text style={detailTitle}>Customer</Text>
          <Text style={lineItem}><span style={lineLabel}>Name:</span> {customerName || 'Unknown'}</Text>
          {customerEmail && <Text style={lineItem}><span style={lineLabel}>Email:</span> {customerEmail}</Text>}
          {customerPhone && <Text style={lineItem}><span style={lineLabel}>Phone:</span> {customerPhone}</Text>}
          {customerAddress && <Text style={lineItem}><span style={lineLabel}>Address:</span> {customerAddress}</Text>}
        </Section>

        <Section style={detailsBox}>
          <Text style={detailTitle}>Booking</Text>
          <Text style={lineItem}><span style={lineLabel}>Stylist:</span> {stylistName || 'Unknown'}</Text>
          <Text style={lineItem}><span style={lineLabel}>Service:</span> {serviceName || 'Unknown'}</Text>
          <Text style={lineItem}><span style={lineLabel}>Date:</span> {bookingDate || 'TBD'}</Text>
          <Text style={lineItem}><span style={lineLabel}>Time:</span> {bookingTime || 'TBD'}</Text>
          {totalPrice && <Text style={lineItem}><span style={lineLabel}>Total:</span> ${totalPrice}</Text>}
          {bookingId && <Text style={lineItem}><span style={lineLabel}>Booking ID:</span> {bookingId}</Text>}
        </Section>

        <Hr style={divider} />

        <Text style={footer}>
          © {new Date().getFullYear()} {SITE_NAME}. Admin notification.
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: AdminBookingAlertEmail,
  to: 'nextlookbeauty@gmail.com',
  subject: (data: Record<string, any>) =>
    `New Booking — ${data.serviceName || 'Service'} for ${data.customerName || 'Customer'} | ${SITE_NAME}`,
  displayName: 'Admin: New booking alert',
  previewData: {
    customerName: 'Jane Doe',
    customerEmail: 'jane@example.com',
    customerPhone: '+1 555 123 4567',
    customerAddress: '123 Main St, Brooklyn, NY',
    stylistName: 'Rishielle G.',
    serviceName: 'Sew-In Weave',
    bookingDate: 'Fri, Apr 11',
    bookingTime: '12:00 PM',
    totalPrice: '258.00',
    bookingId: 'abc-123',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "'Inter', Arial, sans-serif" }
const container = { padding: '30px 25px', maxWidth: '560px', margin: '0 auto' }
const logo = { margin: '0 auto 24px', display: 'block' }
const h1 = { fontSize: '24px', fontWeight: '700', color: '#1a1a2e', margin: '0 0 16px', textAlign: 'center' as const }
const text = { fontSize: '14px', color: '#55575d', lineHeight: '1.6', margin: '0 0 16px' }
const detailsBox = { backgroundColor: '#faf7f2', borderRadius: '12px', padding: '20px', margin: '0 0 16px', border: '1px solid #e5e0d5' }
const detailTitle = { fontSize: '15px', fontWeight: '700', color: '#3D1A6E', margin: '0 0 10px', textTransform: 'uppercase' as const, letterSpacing: '0.5px' }
const lineItem = { fontSize: '13px', color: '#55575d', margin: '0 0 6px', lineHeight: '1.5' }
const lineLabel = { fontWeight: '600', color: '#1a1a2e' }
const divider = { borderColor: '#e5e5e5', margin: '12px 0' }
const footer = { fontSize: '12px', color: '#999999', margin: '0 0 4px', textAlign: 'center' as const }
