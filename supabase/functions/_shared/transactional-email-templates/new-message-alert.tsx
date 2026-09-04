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
const SITE_URL = 'https://nextlookbeauty.com'

interface NewMessageAlertProps {
  recipientName?: string
  senderName?: string
  messagePreview?: string
  inboxUrl?: string
}

const NewMessageAlertEmail = ({
  recipientName,
  senderName,
  messagePreview,
  inboxUrl,
}: NewMessageAlertProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>New message from {senderName || 'a client'} on {SITE_NAME}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Img src={LOGO_URL} alt={SITE_NAME} width="140" height="auto" style={logo} />

        <Heading style={h1}>You have a new message</Heading>

        <Text style={text}>
          {recipientName ? `Hi ${recipientName},` : 'Hi there,'} {senderName || 'Someone'} just sent you a
          message on {SITE_NAME}.
        </Text>

        {messagePreview && (
          <Section style={quoteBox}>
            <Text style={quoteAuthor}>{senderName || 'New message'}</Text>
            <Text style={quoteText}>{messagePreview}</Text>
          </Section>
        )}

        <Section style={{ textAlign: 'center' as const, margin: '24px 0' }}>
          <Button href={inboxUrl || `${SITE_URL}/messages`} style={button}>
            Read &amp; Reply
          </Button>
        </Section>

        <Text style={text}>
          Replying quickly helps you win more bookings. All conversations stay inside {SITE_NAME}.
        </Text>

        <Hr style={divider} />

        <Text style={footer}>
          Visit <Link href={SITE_URL} style={link}>{SITE_NAME}</Link>.
        </Text>
        <Text style={footer}>
          © {new Date().getFullYear()} {SITE_NAME}. All rights reserved.
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: NewMessageAlertEmail,
  subject: (data: Record<string, any>) =>
    `New message from ${data.senderName || 'a client'} | ${SITE_NAME}`,
  displayName: 'New message notification',
  previewData: {
    recipientName: 'Rishielle',
    senderName: 'Jane',
    messagePreview: 'Hi! Do you have availability this Saturday?',
    inboxUrl: `${SITE_URL}/messages`,
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "'Inter', Arial, sans-serif" }
const container = { padding: '30px 25px', maxWidth: '560px', margin: '0 auto' }
const logo = { margin: '0 auto 24px', display: 'block' }
const h1 = { fontSize: '24px', fontWeight: '700', color: '#1a1a2e', margin: '0 0 16px', textAlign: 'center' as const }
const text = { fontSize: '14px', color: '#55575d', lineHeight: '1.6', margin: '0 0 16px' }
const quoteBox = { backgroundColor: '#faf7ef', borderRadius: '12px', padding: '18px', margin: '0 0 12px', border: '1px solid #e8d9a8' }
const quoteAuthor = { fontSize: '13px', fontWeight: '700', color: '#1a1a2e', margin: '0 0 6px' }
const quoteText = { fontSize: '14px', color: '#55575d', margin: '0', lineHeight: '1.6' }
const button = { backgroundColor: '#6b21a8', color: '#ffffff', fontSize: '14px', fontWeight: '600', padding: '12px 26px', borderRadius: '999px', textDecoration: 'none' }
const divider = { borderColor: '#e5e5e5', margin: '12px 0' }
const link = { color: '#c026d3', textDecoration: 'underline' }
const footer = { fontSize: '12px', color: '#999999', margin: '0 0 4px', textAlign: 'center' as const }
