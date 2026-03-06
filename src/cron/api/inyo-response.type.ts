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
