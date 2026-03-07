export interface TrailConfig {
  trailId: string;
  startDate: string;
  endDate: string;
}

export interface AvailabilityResult {
  availableDates: string[];
  permitId: string;
  trailId: string;
  startDate: string;
  endDate: string;
  bookingUrl: string;
}
