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
  Link,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = 'NextLook Beauty'
const LOGO_URL = 'https://wmumnlhzjvscoyuqljyj.supabase.co/storage/v1/object/public/email-assets/logo.png'
const SITE_URL = 'https://tryon-style-match.lovable.app'

interface BookingConfirmedProps {
  customerName?: string
  serviceName?: string
  stylistName?: string
  bookingDate?: string
  bookingTime?: string
  totalPrice?: string
}

const BookingConfirmedEmail = ({
  customerName,
  serviceName,
  stylistName,
  bookingDate,
  bookingTime,
  totalPrice,
}: BookingConfirmedProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your booking with {stylistName || 'your stylist'} has been confirmed!</Preview>
    <Body style={main}>
      <Container style={container}>
        <Img src={LOGO_URL} alt={SITE_NAME} width="140" height="auto" style={logo} />

        <Heading style={h1}>Booking Confirmed! 🎉</Heading>

        <Text style={text}>
          {customerName ? `Hey ${customerName},` : 'Hey there,'} great news! Your stylist has confirmed your appointment.
        </Text>

        <Section style={detailsBox}>
          <Text style={detailTitle}>📋 Appointment Details</Text>
          <Text style={lineItem}>
            <span style={lineLabel}>Service:</span> {serviceName || 'Hair Service'}
          </Text>
          <Text style={lineItem}>
            <span style={lineLabel}>Stylist:</span> {stylistName || 'Your Stylist'}
          </Text>
          <Text style={lineItem}>
            <span style={lineLabel}>Date:</span> {bookingDate || 'TBD'}
          </Text>
          <Text style={lineItem}>
            <span style={lineLabel}>Time:</span> {bookingTime || 'TBD'}
          </Text>
          {totalPrice && (
            <Text style={lineItem}>
              <span style={lineLabel}>Total:</span> ${totalPrice}
            </Text>
          )}
        </Section>

        <Text style={text}>
          Your stylist is looking forward to seeing you! If you need to make any changes, please reach out through the app.
        </Text>

        <Hr style={divider} />

        <Text style={footer}>
          Need help? Reply to this email or visit{' '}
          <Link href={SITE_URL} style={link}>{SITE_NAME}</Link>.
        </Text>
        <Text style={footer}>
          © {new Date().getFullYear()} {SITE_NAME}. All rights reserved.
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: BookingConfirmedEmail,
  subject: (data: Record<string, any>) =>
    `Confirmed — ${data.serviceName || 'Your Appointment'} with ${data.stylistName || 'Your Stylist'} | ${SITE_NAME}`,
  displayName: 'Booking confirmed by stylist',
  previewData: {
    customerName: 'Jane',
    serviceName: 'Sew-In Weave',
    stylistName: 'Rishielle G.',
    bookingDate: 'Fri, Apr 11',
    bookingTime: '12:00 PM',
    totalPrice: '80.00',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "'Inter', Arial, sans-serif" }
const container = { padding: '30px 25px', maxWidth: '560px', margin: '0 auto' }
const logo = { margin: '0 auto 24px', display: 'block' }
const h1 = { fontSize: '24px', fontWeight: '700', color: '#1a1a2e', margin: '0 0 16px', textAlign: 'center' as const }
const text = { fontSize: '14px', color: '#55575d', lineHeight: '1.6', margin: '0 0 16px' }
const detailsBox = { backgroundColor: '#f0fdf4', borderRadius: '12px', padding: '20px', margin: '0 0 20px', border: '1px solid #bbf7d0' }
const detailTitle = { fontSize: '16px', fontWeight: '700', color: '#1a1a2e', margin: '0 0 12px' }
const lineItem = { fontSize: '13px', color: '#55575d', margin: '0 0 6px', lineHeight: '1.5' }
const lineLabel = { fontWeight: '600', color: '#1a1a2e' }
const divider = { borderColor: '#e5e5e5', margin: '12px 0' }
const link = { color: '#c026d3', textDecoration: 'underline' }
const footer = { fontSize: '12px', color: '#999999', margin: '0 0 4px', textAlign: 'center' as const }
