import { Component } from '@angular/core';
import { DialogRef, ModalComponent } from 'angular2-modal';

@Component({
    templateUrl: './data-object-modal-view.component.html'
})
export class DataObjectViewComponent implements ModalComponent<any> {

    /**
     * @type {any}
     */
    context: any;

    /**
     * @param {DialogRef} dialog
     */
    constructor(public dialog: DialogRef<any>) {
        this.context = dialog.context;
    }

    /**
     *
     */
    closeModal(): void {
        this.dialog.dismiss();
    }

    /**
     * @param {any} file
     * @return {string}
     */
    getFileTypeClass(file: any): string {
        switch (file.type) {
            case 'image':
                return 'fa fa-file-image-o';
            case 'code':
                return 'fa fa-file-code-o';
            default:
                return 'fa fa-file-o';
        }
    }
}
