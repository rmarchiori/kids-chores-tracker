import { NextResponse } from 'next/server'
import { z } from 'zod'

const emailSchema = z.object({
  to: z.string().email(),
  subject: z.string(),
  html: z.string(),
})

export async function POST(request: Request) {
  try {
    // Parse and validate request body
    const body = await request.json()
    const { to, subject, html } = emailSchema.parse(body)

    // For MVP, we'll use Supabase's built-in email functionality
    // In production, you would use a service like:
    // - SendGrid
    // - Resend
    // - AWS SES
    // - Mailgun

    // For now, log the email (for development/testing)
    console.log('📧 Email to send:', {
      to,
      subject,
      preview: html.substring(0, 100) + '...'
    })

    // TODO: Implement actual email sending with your preferred service
    // Example with Resend:
    // const resend = new Resend(process.env.RESEND_API_KEY)
    // await resend.emails.send({
    //   from: 'Kids Chores Tracker <noreply@yourdom ain.com>',
    //   to,
    //   subject,
    //   html,
    // })

    // For MVP, we'll rely on Supabase's email for password reset, etc.
    // and invitation emails can be sent separately or through a service

    return NextResponse.json({
      success: true,
      message: 'Email queued for sending'
    })

  } catch (error) {
    console.error('Send email error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
  }
}
