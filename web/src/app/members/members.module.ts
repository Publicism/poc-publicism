import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MembersRoutingModule } from './members-routing.module';
import { MembersComponent } from './members.component';
import { MemberService } from './member.service';
import { TooltipModule } from 'ngx-bootstrap/tooltip';

@NgModule({
    imports: [
        CommonModule,
        MembersRoutingModule,
        TooltipModule.forRoot()
    ],
    declarations: [MembersComponent],
    providers: [MemberService]
})
export class MembersModule {
    //
}
