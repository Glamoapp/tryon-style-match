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

interface FirstBookingWelcomeProps {
  customerName?: string
  serviceName?: string
  stylistName?: string
  bookingDate?: string
  bookingTime?: string
}

const FirstBookingWelcomeEmail = ({
  customerName,
  serviceName,
  stylistName,
  bookingDate,
  bookingTime,
}: FirstBookingWelcomeProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Welcome to {SITE_NAME}! You've unlocked GlowUp Mondays 🎉</Preview>
    <Body style={main}>
      <Container style={container}>
        <Img src={LOGO_URL} alt={SITE_NAME} width="140" height="auto" style={logo} />

        <Heading style={h1}>Welcome to the Family! 🎉</Heading>

        <Text style={text}>
          {customerName ? `Hey ${customerName},` : 'Hey there,'} congratulations on
          booking your very first appointment with {SITE_NAME}! We're so excited to
          have you and can't wait to make you feel like royalty.
        </Text>

        {serviceName && (
          <Section style={bookingBox}>
            <Text style={bookingTitle}>📋 Your Upcoming Appointment</Text>
            <Text style={lineItem}>
              <span style={lineLabel}>Service:</span> {serviceName}
            </Text>
            {stylistName && (
              <Text style={lineItem}>
                <span style={lineLabel}>Stylist:</span> {stylistName}
              </Text>
            )}
            {bookingDate && (
              <Text style={lineItem}>
                <span style={lineLabel}>Date:</span> {bookingDate} at {bookingTime || 'TBD'}
              </Text>
            )}
          </Section>
        )}

        <Section style={glowUpBox}>
          <Text style={glowUpTitle}>✨ You've Unlocked GlowUp Mondays!</Text>
          <Text style={text}>
            As a booked customer, you now have exclusive access to <strong>GlowUp Mondays</strong> — 
            our weekly rewards program with amazing deals, discounts, and promotions 
            available only to our valued clients like you!
          </Text>
          <Text style={text}>
            Here's how it works:
          </Text>
          <Text style={bulletItem}>🏆 <strong>Earn points</strong> with every booking you complete</Text>
          <Text style={bulletItem}>🎁 <strong>Redeem rewards</strong> for discounts on future services</Text>
          <Text style={bulletItem}>💎 <strong>Unlock exclusive deals</strong> every Monday just for you</Text>
          <Text style={bulletItem}>👑 <strong>Level up</strong> — the more you book, the bigger the rewards</Text>

          <Button style={ctaButton} href={`${SITE_URL}/glowup-monday`}>
            Explore GlowUp Mondays →
          </Button>
        </Section>

        <Section style={tipsBox}>
          <Text style={tipsTitle}>💡 Quick Tips for Your First Visit</Text>
          <Text style={bulletItem}>📍 Have your address ready — your stylist comes to you!</Text>
          <Text style={bulletItem}>🔑 You'll receive a completion code — share it with your stylist when done</Text>
          <Text style={bulletItem}>⭐ Leave a review after to help other clients find great stylists</Text>
        </Section>

        <Hr style={divider} />

        <Text style={footer}>
          Questions? Reply to this email or visit{' '}
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
  component: FirstBookingWelcomeEmail,
  subject: `Welcome to ${SITE_NAME}! You've unlocked GlowUp Mondays ✨`,
  displayName: 'First booking welcome',
  previewData: {
    customerName: 'Jane',
    serviceName: 'Sew-In Weave',
    stylistName: 'Keisha M.',
    bookingDate: 'Sat, Mar 29',
    bookingTime: '2:00 PM',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "'Inter', Arial, sans-serif" }
const container = { padding: '30px 25px', maxWidth: '560px', margin: '0 auto' }
const logo = { margin: '0 auto 24px', display: 'block' as const }
const h1 = { fontSize: '24px', fontWeight: '700' as const, color: '#1a1a2e', margin: '0 0 16px', textAlign: 'center' as const }
const text = { fontSize: '14px', color: '#55575d', lineHeight: '1.6', margin: '0 0 16px' }
const bookingBox = { backgroundColor: '#faf5ff', borderRadius: '12px', padding: '20px', margin: '0 0 20px', border: '1px solid #e9d5ff' }
const bookingTitle = { fontSize: '16px', fontWeight: '700' as const, color: '#1a1a2e', margin: '0 0 12px' }
const lineItem = { fontSize: '13px', color: '#55575d', margin: '0 0 6px', lineHeight: '1.5' }
const lineLabel = { fontWeight: '600' as const, color: '#1a1a2e' }
const glowUpBox = { backgroundColor: '#fdf2f8', borderRadius: '12px', padding: '24px', margin: '0 0 20px', border: '1px solid #fbcfe8' }
const glowUpTitle = { fontSize: '18px', fontWeight: '700' as const, color: '#1a1a2e', margin: '0 0 12px' }
const bulletItem = { fontSize: '14px', color: '#55575d', lineHeight: '1.6', margin: '0 0 8px', paddingLeft: '4px' }
const ctaButton = { backgroundColor: '#c026d3', color: '#ffffff', borderRadius: '8px', padding: '14px 28px', fontSize: '14px', fontWeight: '600' as const, textDecoration: 'none', display: 'inline-block' as const, margin: '12px 0 0' }
const tipsBox = { backgroundColor: '#f0fdf4', borderRadius: '12px', padding: '20px', margin: '0 0 20px', border: '1px solid #bbf7d0' }
const tipsTitle = { fontSize: '16px', fontWeight: '700' as const, color: '#1a1a2e', margin: '0 0 12px' }
const divider = { borderColor: '#e5e5e5', margin: '16px 0' }
const link = { color: '#c026d3', textDecoration: 'underline' }
const footer = { fontSize: '12px', color: '#999999', margin: '0 0 4px', textAlign: 'center' as const }
