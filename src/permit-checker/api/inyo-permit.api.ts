import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { PermitAvailabilityAbstractApi } from './permit-availability.abstract.api';
import { AvailabilityResult, TrailConfig } from './availability-result.type';
import { requireEnvVar } from '../../util/require-env-var';

export interface QuotaUsage {
  total: number;
  remaining: number;
}

export interface Division {
  quota_usage_by_member_daily: QuotaUsage;
  is_walkup: boolean;
}

export interface AvailabilityResponseBody {
  payload: Record<string, Record<string, Division>>;
}

@Injectable()
export class InyoPermitApi extends PermitAvailabilityAbstractApi {
  private readonly permitId: string;
  private readonly REC_GOV_URL = 'https://www.recreation.gov';

  constructor(private readonly http: HttpService) {
    super();
    this.permitId = requireEnvVar('INYO_WILDERNESS_PERMIT_ID');
  }

  private isAvailabilityResponseBody(
    data: unknown,
  ): data is AvailabilityResponseBody {
    if (typeof data !== 'object' || data === null) return false;
    if (!('payload' in data)) return false;
    return typeof data.payload === 'object' && data.payload !== null;
  }

  async check(trails: TrailConfig[]): Promise<AvailabilityResult[]> {
    const startDate = trails.map((t) => t.startDate).sort()[0];
    const endDate = trails
      .map((t) => t.endDate)
      .sort()
      .at(-1)!;

    const response = await firstValueFrom(
      this.http.get(
        `${this.REC_GOV_URL}/api/permitinyo/${this.permitId}/availabilityv2?start_date=${startDate}&end_date=${endDate}&commercial_acct=false`,
        {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3.1 Safari/605.1.15',
            Accept: '*/*',
            'Accept-Language': 'en-US,en;q=0.9',
            'Sec-Fetch-Site': 'same-origin',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Dest': 'empty',
            Referer: `${this.REC_GOV_URL}/permits/${this.permitId}/registration/detailed-availability?date=${new Date().toISOString().slice(0, 10)}&type=overnight-permit`,
          },
          validateStatus: () => true,
        },
      ),
    );

    if (response.status !== 200) {
      throw new Error(`Unexpected status: ${response.status}`);
    }

    const data: unknown = response.data;
    if (!this.isAvailabilityResponseBody(data)) {
      throw new Error('Unexpected response shape');
    }

    return trails.map((trail) => {
      const availableDates = Object.entries(data.payload)
        .filter(([date, divisions]) => {
          if (date < trail.startDate || date > trail.endDate) return false;
          const division = divisions[trail.trailId];
          return (
            division != null &&
            division.quota_usage_by_member_daily.remaining > 0
          );
        })
        .map(([date]) => date)
        .sort();

      return {
        availableDates,
        permitId: this.permitId,
        trailId: trail.trailId,
        startDate: trail.startDate,
        endDate: trail.endDate,
        bookingUrl: `${this.REC_GOV_URL}/permits/${this.permitId}`,
      };
    });
  }
}
