import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PermitAvailabilityAbstractApi } from './api/permit-availability.abstract.api';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class PermitCheckerCron implements OnModuleInit {
  private readonly logger = new Logger(PermitCheckerCron.name);

  constructor(
    private readonly api: PermitAvailabilityAbstractApi,
    private readonly notifications: NotificationService,
  ) {}

  onModuleInit() {
    void this.check();
  }

  async check() {
    this.logger.log('Checking permit availability...');

    try {
      const { availableDates, permitId, bookingUrl } = await this.api.check();

      if (availableDates.length > 0) {
        this.logger.log(
          `PERMIT AVAILABLE on: ${availableDates.join(', ')}. Sending alert...`,
        );
        await this.notifications.send(
          `Wilderness permit ${permitId} has openings on: ${availableDates.join(', ')}. Book now: ${bookingUrl}`,
        );
      } else {
        this.logger.log(`No availability for permit ${permitId}.`);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.error(`Availability check failed: ${message}`);
      process.exit(1);
    }

    process.exit(0);
  }
}
