import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MembersComponent } from './members/members.component';
import { PagenotfoundComponent } from './layout/pagenotfound/pagenotfound.component';
import { MyNetworkComponent } from './my-network/my-network.component';
import { BalanceComponent } from './balance/balance.component';
import {
    MyDataObjectsComponent,
    RequestDataObjectComponent,
    RequestHistoryComponent,
    RequestHistoryDetailWrapperComponent
} from './data-objects';

const routes: Routes = [
    {
        path: 'my-network',
        component: MyNetworkComponent
    },
    {
        path: 'members',
        component: MembersComponent
    },
    {
        path: 'data-objects',
        children: [
            {
                path: '',
                component: MyDataObjectsComponent
            },
            {
                path: ':id/edit',
                component: MyDataObjectsComponent
            }
        ]
    },
    {
        path: 'request-data-objects',
        component: RequestDataObjectComponent
    },
    {
        path: 'request-history',
        children: [
            {
                path: '',
                component: RequestHistoryComponent
            },
            {
                path: ':id/:memberId',
                component: RequestHistoryDetailWrapperComponent
            }
        ]
    },
    {
        path: 'balance',
        children: [
            {
                path: '',
                component: BalanceComponent
            }
        ]
    },
    {
        path: '',
        redirectTo: 'my-network',
        pathMatch: 'full'
    },
    {
        path: '**',
        component: PagenotfoundComponent
    }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule {
    //
}
