/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Button,
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

interface BookingConfirmationProps {
  customerName?: string
  serviceName?: string
  stylistName?: string
  bookingDate?: string
  bookingTime?: string
  servicePrice?: string
  productTitle?: string
  productPrice?: string
  productQuantity?: number
  totalAmount?: string
  completionCode?: string
  rewardPoints?: number
}

const BookingConfirmationEmail = ({
  customerName,
  serviceName,
  stylistName,
  bookingDate,
  bookingTime,
  servicePrice,
  productTitle,
  productPrice,
  productQuantity,
  totalAmount,
  completionCode,
  rewardPoints,
}: BookingConfirmationProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your booking is confirmed! Here's your receipt from {SITE_NAME}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Img src={LOGO_URL} alt={SITE_NAME} width="140" height="auto" style={logo} />

        <Heading style={h1}>Thank You for Booking! ✨</Heading>

        <Text style={text}>
          {customerName ? `Hey ${customerName},` : 'Hey there,'} your order has been confirmed!
          Here's your receipt.
        </Text>

        <Section style={receiptBox}>
          <Text style={receiptTitle}>📋 Order Receipt</Text>

          {serviceName && (
            <>
              <Text style={lineItem}>
                <span style={lineLabel}>Service:</span> {serviceName}
              </Text>
              <Text style={lineItem}>
                <span style={lineLabel}>Stylist:</span> {stylistName || 'TBD'}
              </Text>
              <Text style={lineItem}>
                <span style={lineLabel}>Date:</span> {bookingDate || 'TBD'} at {bookingTime || 'TBD'}
              </Text>
              <Text style={lineItem}>
                <span style={lineLabel}>Service Price:</span> ${servicePrice || '0.00'}
              </Text>
            </>
          )}

          {productTitle && (
            <>
              <Hr style={divider} />
              <Text style={lineItem}>
                <span style={lineLabel}>Product:</span> {productTitle} × {productQuantity || 1}
              </Text>
              <Text style={lineItem}>
                <span style={lineLabel}>Product Price:</span> ${productPrice || '0.00'}
              </Text>
            </>
          )}

          <Hr style={divider} />
          <Text style={totalLine}>
            <span style={lineLabel}>Total:</span> ${totalAmount || '0.00'}
          </Text>
        </Section>

        {completionCode && (
          <Section style={codeBox}>
            <Text style={codeTitle}>🔑 Your Completion Code</Text>
            <Text style={codeValue}>{completionCode}</Text>
            <Text style={codeNote}>
              Share this code with your stylist when they arrive. This confirms your service is complete and releases payment.
            </Text>
          </Section>
        )}

        <Section style={rewardBox}>
          <Text style={rewardTitle}>🎉 You Earned Rewards!</Text>
          <Text style={text}>
            You've earned <strong>{rewardPoints || 10} points</strong> from this booking!
            You now have access to <strong>GlowUp Mondays</strong> — exclusive weekly deals
            and promotions just for our booked customers.
          </Text>
          <Button style={ctaButton} href={`${SITE_URL}/glowup-monday`}>
            Check Out This Week's Deals →
          </Button>
        </Section>

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
  component: BookingConfirmationEmail,
  subject: (data: Record<string, any>) =>
    `Booking Confirmed — ${data.serviceName || 'Your Order'} | ${SITE_NAME}`,
  displayName: 'Booking confirmation with receipt',
  previewData: {
    customerName: 'Jane',
    serviceName: 'Sew-In Weave',
    stylistName: 'Keisha M.',
    bookingDate: 'Sat, Mar 29',
    bookingTime: '2:00 PM',
    servicePrice: '120.00',
    productTitle: '24" Brazilian Body Wave',
    productPrice: '89.99',
    productQuantity: 2,
    totalAmount: '299.99',
    completionCode: '482910',
    rewardPoints: 20,
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "'Inter', Arial, sans-serif" }
const container = { padding: '30px 25px', maxWidth: '560px', margin: '0 auto' }
const logo = { margin: '0 auto 24px', display: 'block' }
const h1 = { fontSize: '24px', fontWeight: '700', color: '#1a1a2e', margin: '0 0 16px', textAlign: 'center' as const }
const text = { fontSize: '14px', color: '#55575d', lineHeight: '1.6', margin: '0 0 16px' }
const receiptBox = { backgroundColor: '#faf5ff', borderRadius: '12px', padding: '20px', margin: '0 0 20px', border: '1px solid #e9d5ff' }
const receiptTitle = { fontSize: '16px', fontWeight: '700', color: '#1a1a2e', margin: '0 0 12px' }
const lineItem = { fontSize: '13px', color: '#55575d', margin: '0 0 6px', lineHeight: '1.5' }
const lineLabel = { fontWeight: '600', color: '#1a1a2e' }
const totalLine = { fontSize: '16px', fontWeight: '700', color: '#1a1a2e', margin: '8px 0 0' }
const divider = { borderColor: '#e5e5e5', margin: '12px 0' }
const codeBox = { backgroundColor: '#fef3c7', borderRadius: '12px', padding: '20px', margin: '0 0 20px', textAlign: 'center' as const, border: '1px solid #fde68a' }
const codeTitle = { fontSize: '14px', fontWeight: '600', color: '#92400e', margin: '0 0 8px' }
const codeValue = { fontSize: '32px', fontWeight: '800', color: '#1a1a2e', letterSpacing: '6px', margin: '0 0 8px' }
const codeNote = { fontSize: '12px', color: '#92400e', margin: '0', lineHeight: '1.4' }
const rewardBox = { backgroundColor: '#fdf2f8', borderRadius: '12px', padding: '20px', margin: '0 0 20px', border: '1px solid #fbcfe8' }
const rewardTitle = { fontSize: '16px', fontWeight: '700', color: '#1a1a2e', margin: '0 0 8px' }
const ctaButton = { backgroundColor: '#c026d3', color: '#ffffff', borderRadius: '8px', padding: '12px 24px', fontSize: '14px', fontWeight: '600', textDecoration: 'none', display: 'inline-block', margin: '8px 0 0' }
const link = { color: '#c026d3', textDecoration: 'underline' }
const footer = { fontSize: '12px', color: '#999999', margin: '0 0 4px', textAlign: 'center' as const }
