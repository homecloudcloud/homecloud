import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { ComponentsModule } from '~/app/shared/components/components.module';
import { DirectivesModule } from '~/app/shared/directives/directives.module';
import { PipesModule } from '~/app/shared/pipes/pipes.module';
import { AuthGuardService } from '~/app/shared/services/auth-guard.service';
import { SystemInformationService } from '~/app/shared/services/system-information.service';
import { LicenseGuardService } from './services/license-guard.service';
import { WizardGuardService } from './services/wizard-guard.service';


@NgModule({
  imports: [CommonModule, ComponentsModule, DirectivesModule, PipesModule],
  exports: [ComponentsModule, DirectivesModule, PipesModule],
  providers: [AuthGuardService, SystemInformationService,LicenseGuardService,WizardGuardService],
})
export class SharedModule {}
