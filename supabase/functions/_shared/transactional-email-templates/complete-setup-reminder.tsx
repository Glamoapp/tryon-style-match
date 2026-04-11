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

interface CompleteSetupReminderProps {
  name?: string
}

const CompleteSetupReminderEmail = ({ name }: CompleteSetupReminderProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Customers want to book you — complete your setup now! — {SITE_NAME}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Img src={LOGO_URL} alt="NextLook Beauty" width="140" height="auto" style={logo} />

        <Heading style={h1}>
          {name ? `Hey ${name}! 👋` : 'Hey there! 👋'}
        </Heading>

        <Text style={text}>
          Customers are searching for stylists like you on <strong>{SITE_NAME}</strong>, but your
          profile isn't fully set up yet — which means they <strong>can't book you</strong>.
        </Text>

        <Text style={textBold}>
          Complete these 5 simple steps to start receiving bookings today:
        </Text>

        <Hr style={divider} />

        <Section style={stepsSection}>
          <Heading style={h2}>📋 Your Setup Checklist</Heading>

          <Section style={stepBox}>
            <Text style={stepNumber}>Step 1</Text>
            <Text style={stepTitle}>PROFILE</Text>
            <Text style={stepDesc}>
              Fill in your name, bio, city, and upload a professional photo.
              This is your first impression — make it count!
            </Text>
          </Section>

          <Section style={stepBox}>
            <Text style={stepNumber}>Step 2</Text>
            <Text style={stepTitle}>SERVICES</Text>
            <Text style={stepDesc}>
              Add the services you offer (e.g. braids, locs, cuts, color).
              Set your price and duration for each one. <strong>Without services listed,
              customers cannot book you!</strong>
            </Text>
          </Section>

          <Section style={stepBox}>
            <Text style={stepNumber}>Step 3</Text>
            <Text style={stepTitle}>STOREFRONT</Text>
            <Text style={stepDesc}>
              Upload portfolio photos showcasing your best work.
              This is what customers see first when deciding to book.
            </Text>
          </Section>

          <Section style={stepBox}>
            <Text style={stepNumber}>Step 4</Text>
            <Text style={stepTitle}>SCHEDULE</Text>
            <Text style={stepDesc}>
              Set your available days and hours so customers know when they can book you.
            </Text>
          </Section>

          <Section style={stepBox}>
            <Text style={stepNumber}>Step 5</Text>
            <Text style={stepTitle}>REVIEW &amp; SUBMIT</Text>
            <Text style={stepDesc}>
              Review everything and submit your profile for approval.
              Once approved, you'll go live on the marketplace!
            </Text>
          </Section>
        </Section>

        <Hr style={divider} />

        <Button style={button} href={`${SITE_URL}/provider-onboarding`}>
          Complete My Setup Now
        </Button>

        <Text style={text}>
          Need help? Check out our{' '}
          <Link href={`${SITE_URL}/handbook`} style={link}>Stylist Handbook</Link>{' '}
          for tips on setting up a standout profile.
        </Text>

        <Text style={footer}>
          With love, The {SITE_NAME} Team 💕
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: CompleteSetupReminderEmail,
  subject: 'Customers Want to Book You — Complete Your Setup Now!',
  displayName: 'Complete setup reminder',
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
const textBold = {
  fontSize: '15px',
  color: 'hsl(270, 30%, 10%)',
  lineHeight: '1.6',
  fontWeight: 'bold' as const,
  margin: '0 0 8px',
}
const divider = { borderColor: 'hsl(270, 10%, 90%)', margin: '24px 0' }
const stepsSection = {
  margin: '0 0 8px',
}
const stepBox = {
  backgroundColor: 'hsl(320, 60%, 97%)',
  borderRadius: '10px',
  padding: '14px 18px',
  margin: '0 0 10px',
}
const stepNumber = {
  fontSize: '11px',
  fontWeight: '700' as const,
  color: 'hsl(320, 70%, 55%)',
  textTransform: 'uppercase' as const,
  letterSpacing: '1px',
  margin: '0 0 2px',
}
const stepTitle = {
  fontSize: '15px',
  fontWeight: 'bold' as const,
  color: 'hsl(270, 30%, 10%)',
  margin: '0 0 4px',
}
const stepDesc = {
  fontSize: '13px',
  color: 'hsl(270, 10%, 45%)',
  lineHeight: '1.5',
  margin: '0',
}
const link = { color: 'hsl(320, 70%, 55%)', textDecoration: 'underline' }
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
  margin: '0 0 24px',
}
const footer = { fontSize: '12px', color: '#999999', margin: '4px 0 0' }
