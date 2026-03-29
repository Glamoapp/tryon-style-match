/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
  Hr,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = 'NextLook Beauty'
const SITE_URL = 'https://tryon-style-match.lovable.app'
const LOGO_URL = 'https://wmumnlhzjvscoyuqljyj.supabase.co/storage/v1/object/public/email-assets/logo.png'

interface StylistSignupConfirmationProps {
  name?: string
}

const StylistSignupConfirmationEmail = ({ name }: StylistSignupConfirmationProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your stylist profile has been submitted for review — {SITE_NAME}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Img src={LOGO_URL} alt="NextLook Beauty" width="140" height="auto" style={logo} />

        <Heading style={h1}>
          {name ? `Thank you, ${name}! ✨` : 'Thank you for signing up! ✨'}
        </Heading>

        <Text style={text}>
          You've successfully signed up as a stylist on <strong>{SITE_NAME}</strong>
          and submitted your profile for review.
        </Text>

        <Hr style={divider} />

        <Section style={statusSection}>
          <Heading style={h2}>📋 What Happens Next?</Heading>
          <Text style={stepText}>
            <strong>1. Profile Review</strong> — Our team is reviewing your
            profile, services, and portfolio. This usually takes 24–48 hours.
          </Text>
          <Text style={stepText}>
            <strong>2. Approval Notification</strong> — You'll receive an email
            once your profile has been approved and is live on the marketplace.
          </Text>
          <Text style={stepText}>
            <strong>3. Start Accepting Bookings</strong> — Once approved,
            customers in your area can discover you and book your services.
          </Text>
        </Section>

        <Text style={text}>
          In the meantime, you can review our{' '}
          <Link href={`${SITE_URL}/handbook`} style={link}>Stylist Handbook</Link>{' '}
          to prepare for your first appointment.
        </Text>

        <Button style={button} href={`${SITE_URL}/provider/dashboard`}>
          View Your Dashboard
        </Button>

        <Text style={footer}>
          If you have any questions, simply reply to this email — we're here to help.
        </Text>
        <Text style={footer}>
          With love, The {SITE_NAME} Team 💕
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: StylistSignupConfirmationEmail,
  subject: 'Your Stylist Profile is Under Review — NextLook Beauty',
  displayName: 'Stylist signup confirmation',
  previewData: { name: 'Sarah' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "'Inter', Arial, sans-serif" }
const container = { padding: '20px 25px', maxWidth: '560px' }
const logo = { margin: '0 0 24px' }
const h1 = {
  fontSize: '24px',
  fontWeight: 'bold' as const,
  color: 'hsl(270, 30%, 10%)',
  margin: '0 0 20px',
}
const h2 = {
  fontSize: '18px',
  fontWeight: 'bold' as const,
  color: 'hsl(320, 70%, 55%)',
  margin: '0 0 16px',
}
const text = {
  fontSize: '14px',
  color: 'hsl(270, 10%, 45%)',
  lineHeight: '1.6',
  margin: '0 0 16px',
}
const stepText = {
  fontSize: '14px',
  color: 'hsl(270, 30%, 10%)',
  lineHeight: '1.6',
  margin: '0 0 12px',
}
const link = { color: 'hsl(320, 70%, 55%)', textDecoration: 'underline' }
const divider = { borderColor: 'hsl(270, 10%, 90%)', margin: '24px 0' }
const statusSection = {
  backgroundColor: 'hsl(320, 60%, 97%)',
  borderRadius: '12px',
  padding: '20px 24px',
  margin: '0 0 24px',
}
const button = {
  backgroundColor: 'hsl(320, 70%, 55%)',
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: '600' as const,
  borderRadius: '12px',
  padding: '12px 28px',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
}
const footer = { fontSize: '12px', color: '#999999', margin: '4px 0 0' }
