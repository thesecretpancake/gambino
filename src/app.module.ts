import { Module } from '@nestjs/common';
import { PermitCheckerModule } from './cron/permit-checker.module';
import { InyoPermitApi } from './cron/api/inyo-permit.api';

@Module({
  imports: [PermitCheckerModule.forFeature(InyoPermitApi)],
})
export class AppModule {}
