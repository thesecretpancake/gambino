import { Injectable, Logger } from '@nestjs/common';
import { createTransport, Transporter } from 'nodemailer';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);
  private readonly transporter: Transporter;
  private readonly to: string;
  private readonly from: string;

  constructor() {
    const host = process.env.SMTP_HOST;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const to = process.env.EMAIL_TO;
    const from = process.env.EMAIL_FROM;

    if (!host) throw new Error('SMTP_HOST is not set');
    if (!user) throw new Error('SMTP_USER is not set');
    if (!pass) throw new Error('SMTP_PASS is not set');
    if (!to) throw new Error('EMAIL_TO is not set');
    if (!from) throw new Error('EMAIL_FROM is not set');

    this.to = to;
    this.from = from;
    const port = process.env.SMTP_PORT
      ? parseInt(process.env.SMTP_PORT, 10)
      : 587;
    this.transporter = createTransport({
      host,
      port,
      secure: false,
      auth: { user, pass },
    });
  }

  async send(message: string): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: this.from,
        to: this.to,
        subject: 'Permit Available',
        text: message,
      });
      this.logger.log(`Email sent to ${this.to}`);
    } catch (err) {
      const errMessage = err instanceof Error ? err.message : String(err);
      this.logger.error(`Failed to send email: ${errMessage}`);
      throw err;
    }
  }
}
