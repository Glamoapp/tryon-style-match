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

interface ServiceCompletedProps {
  customerName?: string
  serviceName?: string
  stylistName?: string
  bookingDate?: string
  totalPrice?: string
  pointsEarned?: number
  totalPoints?: number
}

const ServiceCompletedEmail = ({
  customerName,
  serviceName,
  stylistName,
  bookingDate,
  totalPrice,
  pointsEarned,
  totalPoints,
}: ServiceCompletedProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your service with {stylistName || 'your stylist'} is complete! ✨</Preview>
    <Body style={main}>
      <Container style={container}>
        <Img src={LOGO_URL} alt={SITE_NAME} width="140" height="auto" style={logo} />

        <Heading style={h1}>Thank You for Booking with {SITE_NAME}! ✨</Heading>

        <Text style={text}>
          {customerName ? `Hey ${customerName},` : 'Hey there,'} your styling session with{' '}
          <strong>{stylistName || 'your stylist'}</strong> is all done! We hope you love your new look.
        </Text>

        <Section style={detailsBox}>
          <Text style={detailTitle}>📋 Service Summary</Text>
          <Text style={lineItem}>
            <span style={lineLabel}>Service:</span> {serviceName || 'Hair Service'}
          </Text>
          <Text style={lineItem}>
            <span style={lineLabel}>Stylist:</span> {stylistName || 'Your Stylist'}
          </Text>
          {bookingDate && (
            <Text style={lineItem}>
              <span style={lineLabel}>Date:</span> {bookingDate}
            </Text>
          )}
          {totalPrice && (
            <>
              <Hr style={divider} />
              <Text style={totalLine}>
                <span style={lineLabel}>Total Charged:</span> ${totalPrice}
              </Text>
            </>
          )}
        </Section>

        {/* Rewards Section */}
        <Section style={rewardsBox}>
          <Text style={rewardsTitle}>🎉 Your GlowUp Rewards</Text>
          {pointsEarned ? (
            <>
              <Text style={rewardsHighlight}>
                +{pointsEarned} points earned from this booking!
              </Text>
              {totalPoints != null && (
                <Text style={rewardsBalance}>
                  Your total balance: <strong>{totalPoints} points</strong>
                </Text>
              )}
            </>
          ) : (
            <Text style={text}>
              You're earning rewards with every booking! Check your dashboard for your points balance.
            </Text>
          )}
          <Text style={rewardsHint}>
            💡 Use your points for discounts on your next booking — the more you book, the more you save!
          </Text>
        </Section>

        {/* Rate Your Stylist */}
        <Section style={reviewBox}>
          <Text style={reviewTitle}>⭐ How was your experience?</Text>
          <Text style={text}>
            We'd love to hear about your experience with {stylistName || 'your stylist'}! Your review helps other customers and supports your stylist.
          </Text>
          <Button style={ctaButton} href={`${SITE_URL}/dashboard`}>
            Leave a Review →
          </Button>
        </Section>

        {/* Rebook CTA */}
        <Section style={rebookBox}>
          <Text style={rebookTitle}>💜 Ready for Your Next Look?</Text>
          <Text style={text}>
            Book again and use your reward points for a discount on your next service. Your stylist would love to see you again!
          </Text>
          <Button style={rebookButton} href={`${SITE_URL}/stylists`}>
            Book Again & Save →
          </Button>
        </Section>

        <Hr style={divider} />

        <Text style={footer}>
          Thank you for choosing{' '}
          <Link href={SITE_URL} style={link}>{SITE_NAME}</Link>! See you next time.
        </Text>
        <Text style={footer}>
          © {new Date().getFullYear()} {SITE_NAME}. All rights reserved.
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: ServiceCompletedEmail,
  subject: (data: Record<string, any>) =>
    `Service Complete — ${data.serviceName || 'Your Appointment'} | ${SITE_NAME}`,
  displayName: 'Service completed notification',
  previewData: {
    customerName: 'Jane',
    serviceName: 'Sew-In Weave',
    stylistName: 'Rishielle G.',
    bookingDate: 'Fri, Apr 11',
    totalPrice: '80.00',
    pointsEarned: 10,
    totalPoints: 35,
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "'Inter', Arial, sans-serif" }
const container = { padding: '30px 25px', maxWidth: '560px', margin: '0 auto' }
const logo = { margin: '0 auto 24px', display: 'block' }
const h1 = { fontSize: '24px', fontWeight: '700', color: '#1a1a2e', margin: '0 0 16px', textAlign: 'center' as const }
const text = { fontSize: '14px', color: '#55575d', lineHeight: '1.6', margin: '0 0 16px' }
const detailsBox = { backgroundColor: '#faf5ff', borderRadius: '12px', padding: '20px', margin: '0 0 20px', border: '1px solid #e9d5ff' }
const detailTitle = { fontSize: '16px', fontWeight: '700', color: '#1a1a2e', margin: '0 0 12px' }
const lineItem = { fontSize: '13px', color: '#55575d', margin: '0 0 6px', lineHeight: '1.5' }
const lineLabel = { fontWeight: '600', color: '#1a1a2e' }
const totalLine = { fontSize: '16px', fontWeight: '700', color: '#1a1a2e', margin: '8px 0 0' }
const divider = { borderColor: '#e5e5e5', margin: '12px 0' }
const rewardsBox = { backgroundColor: '#f0fdf4', borderRadius: '12px', padding: '20px', margin: '0 0 20px', border: '1px solid #bbf7d0' }
const rewardsTitle = { fontSize: '16px', fontWeight: '700', color: '#1a1a2e', margin: '0 0 8px' }
const rewardsHighlight = { fontSize: '18px', fontWeight: '700', color: '#16a34a', margin: '0 0 6px', textAlign: 'center' as const }
const rewardsBalance = { fontSize: '14px', color: '#55575d', margin: '0 0 8px', textAlign: 'center' as const }
const rewardsHint = { fontSize: '13px', color: '#16a34a', margin: '8px 0 0', fontStyle: 'italic' as const }
const reviewBox = { backgroundColor: '#fef3c7', borderRadius: '12px', padding: '20px', margin: '0 0 20px', border: '1px solid #fde68a' }
const reviewTitle = { fontSize: '16px', fontWeight: '700', color: '#1a1a2e', margin: '0 0 8px' }
const ctaButton = { backgroundColor: '#c026d3', color: '#ffffff', borderRadius: '8px', padding: '12px 24px', fontSize: '14px', fontWeight: '600', textDecoration: 'none', display: 'inline-block', margin: '8px 0 0' }
const rebookBox = { backgroundColor: '#faf5ff', borderRadius: '12px', padding: '20px', margin: '0 0 20px', border: '1px solid #e9d5ff' }
const rebookTitle = { fontSize: '16px', fontWeight: '700', color: '#1a1a2e', margin: '0 0 8px' }
const rebookButton = { backgroundColor: '#7c3aed', color: '#ffffff', borderRadius: '8px', padding: '12px 24px', fontSize: '14px', fontWeight: '600', textDecoration: 'none', display: 'inline-block', margin: '8px 0 0' }
const link = { color: '#c026d3', textDecoration: 'underline' }
const footer = { fontSize: '12px', color: '#999999', margin: '0 0 4px', textAlign: 'center' as const }
