import { Module } from '@nestjs/common';
import { PermitCheckerModule } from './permit-checker/permit-checker.module';
import { InyoPermitApi } from './permit-checker/api/inyo-permit.api';

@Module({
  imports: [PermitCheckerModule.forFeature(InyoPermitApi)],
})
export class AppModule {}
