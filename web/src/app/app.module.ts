import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { ModalModule } from 'angular2-modal';
import { BootstrapModalModule } from 'angular2-modal/plugins/bootstrap';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SimpleNotificationsModule } from 'angular2-notifications';
import { LaddaModule } from 'angular2-ladda';

import { AppComponent } from './app.component';
import { LayoutModule } from './layout/layout.module';
import { MembersModule } from './members/members.module';
import { AppRoutingModule } from './app-routing.module';
import { DataObjectsModule } from './data-objects/data-objects.module';
import { DataObjectFormComponent } from './data-objects/data-object-modal-form/data-object-modal-form.component';
import { DataObjectViewComponent } from './data-objects/data-object-modal-view/data-object-modal-view.component';
import { MyNetworkComponent } from './my-network/my-network.component';
import { BalanceModule } from './balance/balance.module';
import { SelectModule } from "ng2-select";

@NgModule({
    declarations: [
        AppComponent,
        DataObjectFormComponent,
        DataObjectViewComponent,
        MyNetworkComponent
    ],
    imports: [
        BrowserModule,
        FormsModule,
        HttpModule,
        ModalModule.forRoot(),
        BootstrapModalModule,
        AppRoutingModule,
        LayoutModule,
        MembersModule,
        DataObjectsModule,
        BrowserAnimationsModule,
        SimpleNotificationsModule.forRoot(),
        LaddaModule,
        BalanceModule,
        SelectModule
    ],
    providers: [],
    bootstrap: [AppComponent],
    exports: [
        DataObjectFormComponent,
        MyNetworkComponent
    ],
    entryComponents: [
        DataObjectFormComponent,
        DataObjectViewComponent
    ]
})
export class AppModule {
    //
}
