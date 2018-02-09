import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './header/header.component';
import { NavigationComponent } from './navigation/navigation.component';
import { PagenotfoundComponent } from './pagenotfound/pagenotfound.component';
import { RouterModule } from '@angular/router';

@NgModule({
    imports: [
        CommonModule,
        RouterModule
    ],
    declarations: [
        HeaderComponent,
        NavigationComponent,
        PagenotfoundComponent
    ],
    exports: [
        HeaderComponent,
        NavigationComponent,
        PagenotfoundComponent
    ]
})
export class LayoutModule {
    //
}
