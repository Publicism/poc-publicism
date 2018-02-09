import { Component, Input, OnChanges, OnInit, SimpleChanges, ViewContainerRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DataObjectService } from '../data-object.service';
import { BSModalContext, Modal } from 'angular2-modal/plugins/bootstrap';
import { overlayConfigFactory } from 'angular2-modal';
import { DataObjectViewComponent } from '../data-object-modal-view/data-object-modal-view.component';
import _ from 'lodash';

@Component({
    selector: 'ngx-app-request-history-detail',
    templateUrl: './request-history-detail.component.html'
})
export class RequestHistoryDetailComponent implements OnInit, OnChanges {

    /**
     * @type {Array<any>}
     */
    details: Array<any> = [];

    /**
     * @type {_}
     */
    _ = _;

    /**
     *
     */
    @Input()
    memberId;

    /**
     *
     */
    @Input()
    id;

    /**
     * @type {boolean}
     */
    tableLoading = false;

    /**
     * @param {ViewContainerRef} vcRef
     * @param {Modal} modal
     * @param {ActivatedRoute} route
     * @param {DataObjectService} dataObjectService
     */
    constructor(private vcRef: ViewContainerRef,
                private modal: Modal,
                private route: ActivatedRoute,
                private dataObjectService: DataObjectService) {
        this.modal.overlay.defaultViewContainer = vcRef;
    }

    /**
     *
     */
    ngOnInit(): void {
        this.route.params.subscribe(params => {
            if (params['id'] !== undefined) {
                this.id = params['id'];
                this.memberId = params['memberId'];

                this.showDODetails();
            }
        });
    }

    /**
     * @param {SimpleChanges} changes
     */
    ngOnChanges(changes: SimpleChanges): void {
        if (changes) {
            this.id = changes.id.currentValue;
            this.memberId = changes.memberId.currentValue;

            this.showDODetails();
        }
    }

    /**
     *
     */
    showDODetails(): void {
        this.tableLoading = true;

        this.dataObjectService
            .getDORequestDetails(this.id)
            .subscribe(details => {
                this.tableLoading = false;
                this.details = details;
            });
    }

    /**
     * @param {any} detail
     */
    showContent(detail: any): void {
        if (detail.dorequeststatus === 'not found') {
            return;
        }

        this.modal
            .open(DataObjectViewComponent, overlayConfigFactory({
                modalTitle: 'Data Object Contents',
                files: detail.files
            }, BSModalContext));
    }

    /**
     * @param {any} detail
     * @return {string}
     */
    getStatusBadgeClass(detail: any): string {
        return detail.dostatus === 'publisher' ? 'badge-success' : 'badge-info';
    }

    /**
     * @param {any} detail
     * @return {string}
     */
    getFileStatusBadgeClass(detail: any): string {
        switch (detail.dorequeststatus) {
            case 'complete':
                return 'badge-primary';
            case 'hash mismatch':
                return 'badge-danger';
            default:
                return 'badge-default';
        }
    }
}
