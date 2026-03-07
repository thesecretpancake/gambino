import { DynamicModule, Module, Type } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { PermitCheckerService } from './permit-checker.service';
import { NotificationModule } from '../notification/notification.module';
import { PermitAvailabilityAbstractApi } from './api/permit-availability.abstract.api';

@Module({})
export class PermitCheckerModule {
  static forFeature(
    apiClass: Type<PermitAvailabilityAbstractApi>,
  ): DynamicModule {
    return {
      module: PermitCheckerModule,
      imports: [NotificationModule, HttpModule],
      providers: [
        apiClass,
        { provide: PermitAvailabilityAbstractApi, useExisting: apiClass },
        PermitCheckerService,
      ],
    };
  }
}
