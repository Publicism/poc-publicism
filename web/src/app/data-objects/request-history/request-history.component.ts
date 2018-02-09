import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DataObjectService } from '../data-object.service';
import { UtilityService } from '../../utility.service';

@Component({
    selector: 'ngx-app-request-history',
    templateUrl: './request-history.component.html'
})
export class RequestHistoryComponent implements OnInit {

    /**
     * @type {Array<any>}
     */
    dataObjects: Array<any> = [];

    /**
     *
     */
    currentMemberId;

    /**
     * @param {Router} router
     * @param {DataObjectService} dataObjectService
     * @param {UtilityService} utilityService
     */
    constructor(private router: Router,
                private dataObjectService: DataObjectService,
                private utilityService: UtilityService) {
        //
    }

    /**
     *
     */
    ngOnInit(): void {
        this.utilityService.getCurrentMemberId(memberId => {
            this.currentMemberId = memberId;

            this.getRequestHistory();
        });
    }

    /**
     * @param {any} dataObject
     */
    gotoDetail(dataObject: any): void {
        this.router.navigate(['/request-history', dataObject.objectid, dataObject.memberid]);
    }

    /**
     *
     */
    protected getRequestHistory(): void {
        this.dataObjectService
            .getRequestHistory()
            .subscribe(dataObjects => {
                this.dataObjects = dataObjects;
            });
    }
}
