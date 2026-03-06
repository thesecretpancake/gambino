import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression, SchedulerRegistry } from '@nestjs/schedule';
import { PermitAvailabilityAbstractApi } from './api/permit-availability.abstract.api';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class PermitCheckerCron implements OnModuleInit {
  private readonly logger = new Logger(PermitCheckerCron.name);

  constructor(
    private readonly api: PermitAvailabilityAbstractApi,
    private readonly notifications: NotificationService,
    private readonly schedulerRegistry: SchedulerRegistry,
  ) {}

  onModuleInit() {
    void this.check();
  }

  @Cron(process.env.CRON_EXPRESSION ?? CronExpression.EVERY_10_MINUTES, {
    name: 'permit-checker',
  })
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
        this.schedulerRegistry.deleteCronJob('permit-checker');
        this.logger.log('Permit found — cron job stopped.');
      } else {
        this.logger.log(`No availability for permit ${permitId}.`);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.error(`Availability check failed: ${message}`);
    }
  }
}
