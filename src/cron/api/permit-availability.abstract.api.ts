import { AvailabilityResult, TrailConfig } from './availability-result.type';

export abstract class PermitAvailabilityAbstractApi {
  abstract check(trails: TrailConfig[]): Promise<AvailabilityResult[]>;
}
