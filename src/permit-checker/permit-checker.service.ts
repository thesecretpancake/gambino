import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PermitAvailabilityAbstractApi } from './api/permit-availability.abstract.api';
import { TrailConfig } from './api/availability-result.type';
import { NotificationService } from '../notification/notification.service';
import { requireEnvVar } from '../util/require-env-var';
import { getErrorMessage } from '../util/get-error-message';

@Injectable()
export class PermitCheckerService implements OnModuleInit {
  private readonly logger = new Logger(PermitCheckerService.name);
  private readonly subscribers: {
    email: string;
    trails: TrailConfig[];
  }[];

  constructor(
    private readonly api: PermitAvailabilityAbstractApi,
    private readonly notifications: NotificationService,
  ) {
    this.subscribers = JSON.parse(requireEnvVar('SUBSCRIBERS'));
  }

  onModuleInit() {
    void this.checkForPermits();
  }

  public async checkForPermits() {
    this.logger.log('Checking permit availability...');

    try {
      const trailMap = this.buildTrailMap();
      const uniqueTrails = [...trailMap.values()].map((v) => v.trail);
      const results = await this.api.check(uniqueTrails);
      await this.sendAlerts(results, trailMap);
    } catch (err) {
      this.logger.error(`Availability check failed: ${getErrorMessage(err)}`);
      process.exit(1);
    }

    process.exit(0);
  }

  private trailKey(t: TrailConfig): string {
    return `${t.trailId}|${t.startDate}|${t.endDate}`;
  }

  private buildTrailMap(): Map<
    string,
    { trail: TrailConfig; recipients: string[] }
  > {
    const trailMap = new Map<
      string,
      { trail: TrailConfig; recipients: string[] }
    >();
    for (const subscriber of this.subscribers) {
      for (const trail of subscriber.trails) {
        const key = this.trailKey(trail);
        let entry = trailMap.get(key);
        if (!entry) {
          entry = { trail, recipients: [] };
          trailMap.set(key, entry);
        }
        entry.recipients.push(subscriber.email);
      }
    }
    return trailMap;
  }

  private async sendAlerts(
    results: Awaited<ReturnType<PermitAvailabilityAbstractApi['check']>>,
    trailMap: ReturnType<typeof this.buildTrailMap>,
  ): Promise<void> {
    await Promise.all(
      results.map(
        ({
          availableDates,
          permitId,
          trailId,
          startDate,
          endDate,
          bookingUrl,
        }) => {
          if (availableDates.length === 0) {
            this.logger.log(
              `No availability for trail ${trailId} (${startDate} to ${endDate}).`,
            );
            return;
          }

          this.logger.log(
            `PERMIT AVAILABLE on trail ${trailId} (${startDate} to ${endDate}): ${availableDates.join(', ')}. Sending alerts...`,
          );

          const { recipients } = trailMap.get(
            this.trailKey({ trailId, startDate, endDate }),
          )!;
          return this.notifications.send(
            recipients,
            `Wilderness permit ${permitId} (trail ${trailId}) has openings on: ${availableDates.join(', ')}. Book now: ${bookingUrl}`,
          );
        },
      ),
    );
  }
}
