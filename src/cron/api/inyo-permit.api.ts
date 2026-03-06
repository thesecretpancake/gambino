import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { PermitAvailabilityAbstractApi } from './permit-availability.abstract.api';
import { AvailabilityResult } from './availability-result.type';
import { AvailabilityResponseBody } from './inyo-response.type';

@Injectable()
export class InyoPermitApi extends PermitAvailabilityAbstractApi {
  private readonly permitId: string;
  private readonly trailId: string;
  private readonly startDate: string;
  private readonly endDate: string;

  constructor(private readonly http: HttpService) {
    super();

    const permitId = process.env.INYO_WILDERNESS_PERMIT_ID;
    const trailId = process.env.INYO_WILDERNESS_TRAIL_ID;
    const startDate = process.env.INYO_START_DATE;
    const endDate = process.env.INYO_END_DATE;

    if (!permitId) throw new Error('INYO_WILDERNESS_PERMIT_ID is not set');
    if (!trailId) throw new Error('INYO_WILDERNESS_TRAIL_ID is not set');
    if (!startDate) throw new Error('INYO_START_DATE is not set');
    if (!endDate) throw new Error('INYO_END_DATE is not set');

    this.permitId = permitId;
    this.trailId = trailId;
    this.startDate = startDate;
    this.endDate = endDate;
  }

  private isAvailabilityResponseBody(
    data: unknown,
  ): data is AvailabilityResponseBody {
    if (typeof data !== 'object' || data === null) return false;
    if (!('payload' in data)) return false;
    return typeof data.payload === 'object' && data.payload !== null;
  }

  async check(): Promise<AvailabilityResult> {
    const response = await firstValueFrom(
      this.http.get(
        `https://www.recreation.gov/api/permitinyo/${this.permitId}/availabilityv2?start_date=${this.startDate}&end_date=${this.endDate}&commercial_acct=false`,
        {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3.1 Safari/605.1.15',
            Accept: '*/*',
            'Accept-Language': 'en-US,en;q=0.9',
            'Sec-Fetch-Site': 'same-origin',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Dest': 'empty',
            Referer: `https://www.recreation.gov/permits/${this.permitId}/registration/detailed-availability?date=${new Date().toISOString().slice(0, 10)}&type=overnight-permit`,
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

    const availableDates = Object.entries(data.payload)
      .filter(([, divisions]) => {
        const division = divisions[this.trailId];
        return (
          division != null && division.quota_usage_by_member_daily.remaining > 0
        );
      })
      .map(([date]) => date)
      .sort();

    return {
      availableDates,
      permitId: this.permitId,
      bookingUrl: `https://www.recreation.gov/permits/${this.permitId}`,
    };
  }
}
