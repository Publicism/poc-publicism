import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LaddaModule } from 'angular2-ladda';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { BalanceComponent } from './balance.component';
import { BalanceService } from './balance.service';

@NgModule({
    imports: [
        CommonModule,
        LaddaModule,
        BrowserAnimationsModule
    ],
    declarations: [BalanceComponent],
    providers: [BalanceService]
})
export class BalanceModule {
    //
}
