import { Injectable, Logger } from '@nestjs/common';
import { createTransport, Transporter } from 'nodemailer';
import { requireEnvVar } from '../util/require-env-var';
import { getErrorMessage } from '../util/get-error-message';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);
  private readonly transporter: Transporter;
  private readonly from: string;

  constructor() {
    const host = requireEnvVar('SMTP_HOST');
    const user = requireEnvVar('SMTP_USER');
    const pass = requireEnvVar('SMTP_PASS');
    const from = requireEnvVar('EMAIL_FROM');

    this.from = from;
    this.transporter = createTransport({
      host,
      secure: false,
      auth: { user, pass },
    });
  }

  async send(to: string[], message: string): Promise<void> {
    if (to.length === 0) return;
    try {
      await this.transporter.sendMail({
        from: this.from,
        to,
        subject: 'Permit Available',
        text: message,
      });
      this.logger.log(`Email sent to ${to.join(', ')}`);
    } catch (err) {
      this.logger.error(`Failed to send email: ${getErrorMessage(err)}`);
      throw err;
    }
  }
}
