import { Component, OnInit } from '@angular/core';
import { UtilityService } from '../../utility.service';

@Component({
    selector: 'ngx-app-navigation',
    templateUrl: './navigation.component.html',
    styleUrls: ['./navigation.component.scss']
})
export class NavigationComponent implements OnInit {

    /**
     * @type {any}
     */
    currentMemberId;

    /**
     * @param {UtilityService} utilityService
     */
    constructor(private utilityService: UtilityService) {
        //
    }

    /**
     *
     */
    ngOnInit(): void {
        this.utilityService.getCurrentMemberId(memberId => {
            this.currentMemberId = memberId;
        });
    }

}
