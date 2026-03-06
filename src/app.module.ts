import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { PermitCheckerModule } from './cron/permit-checker.module';
import { InyoPermitApi } from './cron/api/inyo-permit.api';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    PermitCheckerModule.forFeature(InyoPermitApi),
  ],
})
export class AppModule {}
