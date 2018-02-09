import { Component, OnInit, ViewContainerRef, ChangeDetectorRef } from '@angular/core';
import { DataObjectService } from '../data-object.service';
import { BSModalContext, Modal } from 'angular2-modal/plugins/bootstrap';
import { overlayConfigFactory } from 'angular2-modal';
import { DataObjectFormComponent } from '../data-object-modal-form/data-object-modal-form.component';
import { DataObjectViewComponent } from '../data-object-modal-view/data-object-modal-view.component';
import { IMember } from "../../members/member";
import { MemberService } from '../../members/member.service';
import { UtilityService } from '../../utility.service';
import { NotificationsService } from 'angular2-notifications/dist';

@Component({
    selector: 'ngx-app-data-objects',
    templateUrl: './my-data-objects.component.html'
})
export class MyDataObjectsComponent implements OnInit {

    /**
     * @type {Array}
     */
    dataObjects: Array<any> = [];

    /**
     * @type {Array}
     */
    requestedDOs: Array<any> = [];


    /**
     * @type {boolean}
     */
    tableLoading = false;

    /**
     * @param {ViewContainerRef} vcRef
     * @param {Modal }modal
     * @param {DataObjectService} dataObjectService
     */
    constructor(private vcRef: ViewContainerRef,
        private modal: Modal,
        private dataObjectService: DataObjectService,
        private memberService: MemberService,
        private cdr: ChangeDetectorRef,
        protected notificationService: NotificationsService,
        private utilityService: UtilityService) {
        this.modal.overlay.defaultViewContainer = vcRef;
    }

    public currentMemberId: number;
    public selectedMemberId: number;
    /**
     * @type {Array<IMember>}
     */

    public members: Array<any> = [];

    /**
     *
     *
     *
     */
    public _selectedMember: any = {};

    /**
    * @type {boolean}
    */
    buttonLoading = false;

    /**
     * @type {string}
     */
    buttonText: any = {};

    /**
     *
     */
    ngOnInit(): void {
        this.utilityService.getCurrentMemberId(memberId => {
            this.currentMemberId = memberId;
            this.doRequestDOs(this.currentMemberId);
            this.getMembers();
            this.getRequestHistory();
        });
        // this.getMyDOs();
        // this.getMembers();
    }

    public doRequestDOs(param: any): void {//it is id string or number
        console.log(`Picked param: ${param}`);
        if (param !== undefined) {
            this._selectedMember = this.members.find(m => m.id == param);
            this.selectedMemberId = param;
            console.log(`doRequestDOs() was emmited with ${param}`);
            this.dataObjects = [];
            this.tableLoading = true;
            this.getRequestHistory();
            this.dataObjectService
                .getMemberDOs(param)
                .subscribe(dataObjects => {
                    this.dataObjects = dataObjects;
                    dataObjects.forEach((el: any) => {
                        this.buttonText[el.doid] = 'Request DO';
                    });
                    this.tableLoading = false;
                });
        } else {
            this.notificationService.warn('Warning', `Need to specify member id`);
        }
    }

    /**
     * This method is used for figuring out was it requested previously
     * @param dataObject
     */
    isRequested(dataObject: any) {
        let response = false;
        let findMatch = this.requestedDOs.find((el: any) => {
            return el.objectid == dataObject.doid
        });
        if (findMatch !== undefined) response = true;
        return response
    }

    /**
     * @param {any} dataObject
     */
    showContent(dataObject: any): void {
        if (this.currentMemberId === this.selectedMemberId) {
            this.modal
            .open(DataObjectViewComponent, overlayConfigFactory({
                modalTitle: 'Data Object Contents',
                files: dataObject.files
            }, BSModalContext));
        } else {
            console.log(`Requesting details for ${dataObject.doid}`);
            this.notificationService.info(`Requesting details...`);
            this.dataObjectService
                .getDORequestDetails(dataObject.doid)
                .subscribe(details => {
                    console.log(`Details for ${dataObject.doid} were requested`);
                    this.notificationService.success(`Details were requested...`)
                    let ownerDetails = details.find((el) => {
                        return el.hasOwnProperty("dorequeststatus")
                    });
                    if (ownerDetails !== undefined) {
                        dataObject.files = ownerDetails.files;
                    }
                    this.modal
                    .open(DataObjectViewComponent, overlayConfigFactory({
                        modalTitle: 'Data Object Contents',
                        files: dataObject.files
                    }, BSModalContext));
                });
        }

    }

    /**
     * @param {string} type
     */
    addDataObject(type: string): void {
        this.modal
            .open(DataObjectFormComponent, overlayConfigFactory({
                modalTitle: 'Add New Data Object',
                type,
                formSubmit: (form: any) => {
                    const subscribtion = this.dataObjectService.addDO(
                        form.type,
                        form.file,
                        form.content,
                        form.name,
                        form.price,
                        form.permissions
                    );

                    subscribtion.subscribe(() => {
                        this.getMyDOs();
                    });

                    return subscribtion;
                }
            }, BSModalContext));
    }

    /**
     * @param {any} dataObject
     */
    updateContent(dataObject: any): void {
        this.modal
            .open(DataObjectFormComponent, overlayConfigFactory({
                modalTitle: 'Update Data Object',
                type: dataObject.info.type,
                dataObject,
                formSubmit: (form: any) => {
                    const subscribtion = this.dataObjectService.updateDO(
                        dataObject.doid,
                        form.type,
                        form.file,
                        form.content,
                        form.name,
                        form.price,
                        form.permissions
                    );

                    subscribtion.subscribe(() => {
                        this.getMyDOs();
                    });

                    return subscribtion;
                }
            }, BSModalContext));
    }

    /**
     *
     */
    protected getMyDOs(): void {
        this.tableLoading = true;

        this.dataObjectService
            .getMyDOs()
            .subscribe(dataObjects => {
                this.dataObjects = dataObjects;

                this.tableLoading = false;
            });
    }
    /**
     *
     */
    protected getMembers(): void {
        this.tableLoading = true
        console.log(`Trying to subscribe to MemberService...`);
        this.memberService
            .getMembers()
            .subscribe(members => {
                let _members = members.map(member => {
                    return {
                        id: member.memberid,
                        text: `${member.membername} <${member.memberstatus}>`
                    }
                })
                this.members = _members;
                console.log(`Got members... ${_members}`);
                this.tableLoading = false; //make loader bool var here
            });
    }

    /**
     *
     */
    protected getRequestHistory(): void {
        this.dataObjectService
            .getRequestHistory()
            .subscribe(requestedDOs => {
                this.requestedDOs = requestedDOs;
            });
    }
    /**
     * @param {any} searchInput
     */
    onSearchDataObjectId(dataObject: any): void {
        const doId = dataObject.doid;

        if (!doId) {
            return;
        }

        this.buttonLoading = true;
        this.buttonText[dataObject.doid] = 'Fetching price...';

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
        this.buttonText[doId] = 'Fetching files...';

        this.dataObjectService
            .requestDO(doId, token)
            .subscribe(response => {
                this.utilityService.getCurrentMemberId(memberId => {
                    if (response.dorequestid) {
                        // this.doId = doId;
                        // this.memberId = memberId;
                        this.notificationService.success('Success', 'Request successful.');
                    } else {
                        this.notificationService.warn('Warning', 'Cannot find data object.');
                    }

                    this.cdr.markForCheck();
                    this.resetSuccess(doId);
                    this.getRequestHistory();
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
                        this.resetSuccess(doId);//i hope text on the upper line meant request was performed successfully before
                    });
            });
    }

    /**
     * @param {string} doId
     * @param {string} memberId
     * @param {number} price
     */
    protected makePayment(doId: string, memberId: string, price: number): void {
        this.buttonText[doId] = 'Paying...';

        this.dataObjectService
            .makePayment(doId, memberId, price)
            .subscribe(response => {
                if (!response.token) {
                    this.notificationService.error('Error', 'Error fetching payment token.');
                    this.resetFail(doId);

                    return;
                }

                this.requestDO(doId, response.token); // Finally we can request some DOs
            });
    }

    protected resetSuccess(doid: string): void {
        this.buttonLoading = false;
        this.buttonText[doid] = 'Requested';
    }

    protected resetFail(doid: string): void {
        this.buttonLoading = false;
        this.buttonText[doid] = 'Request DO';
    }
}
