import { ChangeDetectorRef, Component, OnInit, ViewContainerRef } from '@angular/core';
import { DataObjectService } from '../data-object.service';
import { UtilityService } from '../../utility.service';
import { Modal } from 'angular2-modal/plugins/bootstrap';
import { NotificationsService } from 'angular2-notifications/dist';

@Component({
    selector: 'ngx-app-request-data-object',
    templateUrl: './request-data-object.component.html'
})
export class RequestDataObjectComponent implements OnInit {

    /**
     * @type {any}
     */
    doId = undefined;

    /**
     * @type {any}
     */
    memberId = undefined;

    /**
     * @type {boolean}
     */
    buttonLoading = false;

    /**
     * @type {any}
     */
    searchInput = undefined;

    /**
     * @type {string}
     */
    buttonText = 'Search';

    /**
     * @param {DataObjectService} dataObjectService
     * @param {ChangeDetectorRef} cdr
     * @param {UtilityService} utility
     * @param {Modal} modal
     * @param {ViewContainerRef} vcRef
     * @param {NotificationsService} notificationService
     */
    constructor(private dataObjectService: DataObjectService,
                private cdr: ChangeDetectorRef,
                private utility: UtilityService,
                private modal: Modal,
                private vcRef: ViewContainerRef,
                private notificationService: NotificationsService) {
        this.modal.overlay.defaultViewContainer = vcRef;
    }

    /**
     *
     */
    ngOnInit(): void {
        //
    }

    /**
     * @param {any} searchInput
     */
    onSearchDataObjectId(searchInput: any): void {
        const doId = searchInput.value;

        if (!doId) {
            return;
        }

        this.buttonLoading = true;
        this.searchInput = searchInput;
        this.buttonText = 'Fetching price...';

        this.dataObjectService
            .requestDOPrice(doId)
            .subscribe(response => {
                if (response.price === 0) {
                    this.requestDO(doId);
                } else {
                    this.showPriceConfirm(doId, response.memberid, response.price);
                }
            });
    }

    /**
     * @param {string} doId
     * @param {string} token
     */
    protected requestDO(doId: string, token?: string): void {
        this.buttonText = 'Fetching files...';

        this.dataObjectService
            .requestDO(doId, token)
            .subscribe(response => {
                this.utility.getCurrentMemberId(memberId => {
                    if (response.dorequestid) {
                        this.doId = doId;
                        this.memberId = memberId;

                        this.notificationService.success('Success', 'Request successful.');
                    } else {
                        this.notificationService.warn('Warning', 'Cannot find data object.');
                    }

                    this.cdr.markForCheck();
                    this.reset();
                });
            });
    }

    /**
     * @param {string} doId
     * @param {string} memberId
     * @param {number} price
     */
    protected showPriceConfirm(doId: string, memberId: string, price: number): void {
        this.modal
            .confirm()
            .title('Payment required')
            .body(`This data objects costs <b>${price} wei</b>. Proceed with payment?`)
            .okBtn('Yes')
            .cancelBtn('No')
            .open()
            .then(resultPromise => {
                resultPromise.result
                    .then(() => {
                        this.makePayment(doId, memberId, price);
                    }, () => {
                        // Do nothing. We're saving our precious Ethers for second-hand Maserati
                        this.reset();
                    });
            });
    }

    /**
     * @param {string} doId
     * @param {string} memberId
     * @param {number} price
     */
    protected makePayment(doId: string, memberId: string, price: number): void {
        this.buttonText = 'Paying...';

        this.dataObjectService
            .makePayment(doId, memberId, price)
            .subscribe(response => {
                if (!response.token) {
                    this.notificationService.error('Error', 'Error fetching payment token.');
                    this.reset();

                    return;
                }

                this.requestDO(doId, response.token); // Finally we can request some DOs
            });
    }

    protected reset(): void {
        this.buttonLoading = false;
        this.searchInput.value = '';
        this.buttonText = 'Search';
    }
}
