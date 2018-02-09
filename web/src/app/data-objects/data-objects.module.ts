import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MyDataObjectsComponent } from './my-data-objects/my-data-objects.component';
import { RequestDataObjectComponent } from './request-data-object/request-data-object.component';
import { RequestHistoryComponent } from './request-history/request-history.component';
import { DataObjectService } from './data-object.service';
import { RequestHistoryDetailComponent } from './request-history/request-history-detail.component';
import { RequestHistoryDetailWrapperComponent } from './request-history/request-history-detail-wrapper.component';
import { UtilityService } from '../utility.service';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { LaddaModule } from 'angular2-ladda';
import { MomentModule } from 'angular2-moment';
import { SelectModule } from 'ng2-select';
import { MemberService } from '../members/member.service';
import { MembersSelectorDropdownComponent } from './members-selector-dropdown/members-selector-dropdown.component';


@NgModule({
    imports: [
        CommonModule,
        RouterModule,
        BrowserAnimationsModule,
        BsDropdownModule.forRoot(),
        LaddaModule,
        MomentModule,
        SelectModule
    ],
    declarations: [
        MyDataObjectsComponent,
        RequestDataObjectComponent,
        RequestHistoryComponent,
        RequestHistoryDetailComponent,
        RequestHistoryDetailWrapperComponent,
        MembersSelectorDropdownComponent
    ],
    exports: [
        MyDataObjectsComponent,
        RequestDataObjectComponent,
        RequestHistoryComponent,
        RequestHistoryDetailComponent,
        RequestHistoryDetailWrapperComponent
    ],
    providers: [
        DataObjectService,
        UtilityService,
        MemberService
    ]
})
export class DataObjectsModule {
    //
}
