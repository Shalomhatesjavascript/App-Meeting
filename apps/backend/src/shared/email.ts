import { type CreateEmailResponse, Resend } from 'resend'
import { BackendEnv } from './env'
import type { EmailOutput } from './schema'

const resend = new Resend(BackendEnv.RESEND_API_KEY)

interface SendEmailProps {
  from?: EmailOutput
  /** Max of 50 emails */
  to: EmailOutput | EmailOutput[]
  subject: string
  html: string
}

export const EmailService = {
  sendEmail: ({
    html,
    subject,
    to,
    from = BackendEnv.EMAIL_SENDER,
  }: SendEmailProps): Promise<CreateEmailResponse> =>
    resend.emails.send({ from, html, subject, to }),
} as const
