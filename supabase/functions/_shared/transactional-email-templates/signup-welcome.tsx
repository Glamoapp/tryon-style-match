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

interface SignupWelcomeProps {
  name?: string
}

const SignupWelcomeEmail = ({ name }: SignupWelcomeProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Welcome to NextLook Beauty — discover GlowUp Monday! ✨</Preview>
    <Body style={main}>
      <Container style={container}>
        <Img src={LOGO_URL} alt="NextLook Beauty" width="140" height="auto" style={logo} />

        <Heading style={h1}>
          {name ? `Welcome, ${name}! ✨` : 'Welcome to NextLook Beauty! ✨'}
        </Heading>

        <Text style={text}>
          You've just joined the most exciting beauty community. Browse top-rated
          stylists, book services, try on hairstyles with our AI Virtual Try-On,
          and shop premium hair extensions — all in one place.
        </Text>

        <Hr style={divider} />

        <Section style={glowUpSection}>
          <Heading style={h2}>💖 Introducing GlowUp Monday</Heading>
          <Text style={text}>
            Every Monday, we drop <strong>exclusive deals, rewards, and promotions</strong> just
            for you — inspired by the best loyalty programs out there. The more you
            book, the more you earn:
          </Text>
          <Section style={pointsTable}>
            <Text style={pointRow}>🌟 <strong>10 pts</strong> — spend under $300</Text>
            <Text style={pointRow}>🌟 <strong>20 pts</strong> — spend over $500</Text>
            <Text style={pointRow}>🌟 <strong>50 pts</strong> — spend over $1,000</Text>
            <Text style={pointRow}>🌟 <strong>100 pts</strong> — spend over $2,000</Text>
          </Section>
          <Text style={text}>
            Book your first service this month to unlock access to exclusive Monday
            promotions and deal drops!
          </Text>
        </Section>

        <Button style={button} href={`${SITE_URL}/stylists`}>
          Find a Stylist
        </Button>

        <Text style={secondaryCta}>
          Or explore{' '}
          <Link href={`${SITE_URL}/glowup-monday`} style={link}>
            GlowUp Monday deals →
          </Link>
        </Text>

        <Text style={footer}>
          We're thrilled to have you. If you have any questions, just reply to
          this email — we're here to help.
        </Text>
        <Text style={footer}>
          With love, The {SITE_NAME} Team 💕
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: SignupWelcomeEmail,
  subject: 'Welcome to NextLook Beauty — Meet GlowUp Monday! 💖',
  displayName: 'Signup welcome',
  previewData: { name: 'Jane' },
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
  margin: '0 0 12px',
}
const text = {
  fontSize: '14px',
  color: 'hsl(270, 10%, 45%)',
  lineHeight: '1.6',
  margin: '0 0 16px',
}
const link = { color: 'hsl(320, 70%, 55%)', textDecoration: 'underline' }
const divider = { borderColor: 'hsl(270, 10%, 90%)', margin: '24px 0' }
const glowUpSection = {
  backgroundColor: 'hsl(320, 60%, 97%)',
  borderRadius: '12px',
  padding: '20px 24px',
  margin: '0 0 24px',
}
const pointsTable = { margin: '0 0 12px' }
const pointRow = {
  fontSize: '14px',
  color: 'hsl(270, 30%, 10%)',
  lineHeight: '1.8',
  margin: '0',
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
const secondaryCta = {
  fontSize: '13px',
  color: 'hsl(270, 10%, 45%)',
  textAlign: 'center' as const,
  margin: '16px 0 24px',
}
const footer = { fontSize: '12px', color: '#999999', margin: '4px 0 0' }
