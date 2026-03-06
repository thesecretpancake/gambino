import { AvailabilityResult } from './availability-result.type';

export abstract class PermitAvailabilityAbstractApi {
  abstract check(): Promise<AvailabilityResult>;
}
