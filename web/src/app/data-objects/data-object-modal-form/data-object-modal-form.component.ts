import {Component, OnInit} from '@angular/core';
import {DialogRef, ModalComponent} from 'angular2-modal';
import {Http} from '@angular/http';
import {MemberService} from '../../members/member.service';
import {IMember} from "../../members/member";

import 'rxjs/add/operator/map';
import {Observable} from 'rxjs/Observable';

@Component({
    templateUrl: './data-object-modal-form.component.html'
})
export class DataObjectFormComponent implements ModalComponent<any>, OnInit {

    /**
     * @type {any}
     */
    context: any;

    /**
     * @type {any}
     */
    model: any;

    /**
     * @type {any}
     */
    file: any;

    /**
     * @type {boolean}
     */
    buttonLoading = false;

    /**
     * @param {DialogRef<any>} dialog
     * @param {Http} http
     */
    constructor(public dialog: DialogRef<any>,
                private http: Http,
                private memberService: MemberService) {
        this.context = dialog.context;
        this.model = {
            name: this.context.dataObject ? this.context.dataObject.info.name : undefined,
            content: undefined,
            price: this.context.dataObject ? this.context.dataObject.info.price : 0,
            file: undefined,
            permissions: []
        };

        if (this.context.dataObject) {
            if (this.context.dataObject.info.type === 'html') {
                this.http.get(this.context.dataObject.files[0].url).subscribe(data => {
                    this.model.content = data.text();
                });
            }

            if (this.context.dataObject.info.permissions) {
                // this.model.permissions = this.context.dataObject.info.permissions.join(',');
                this.model.permissions = this.context.dataObject.info.permissions;
                // console.log(`Permissions found ${JSON.stringify(this.model.permissions)}`);
            }
        }
    }

    public members: IMember[];
    public loading: boolean;
    public _permissions: any[];

    ngOnInit() {
        this._permissions = [];
        // this.members$ = this.memberService.getMembers(); //for ngFor async
        this.loading = true;
        this.memberService.getMembers().subscribe(r => {
            this.members = r; //for submit
            this.loading = false;
            r.forEach(r => {
                if (this.model.permissions && this.model.permissions.indexOf("all") !== -1) {
                    this._permissions[r.memberid] = true;
                } else if (this.model.permissions && this.model.permissions.indexOf(r.memberid.toString()) == -1) {
                    this._permissions[r.memberid] = false;
                } else {
                    this._permissions[r.memberid] = true;
                }

            });
            if (!this.context.dataObject) {
                this.selectAll({});
            }
            // console.log(`Got members from subscription ${this.members}`);
            // console.log(`_permissions array created ${this._permissions}, length = ${this._permissions.length}`);
        }, e => {
            this.loading = false;
        });
    }
    /**
     *
     */
    closeModal(): void {
        this.dialog.dismiss();
    }

    /**
     * @param {any} data
     */
    formSubmit(data: any): void {
        // this.memberService.getMembers().subscribe(r => {
        //     this.members = r;
        //     console.log(this.members);
        // });
        this.buttonLoading = true;

        data.type = this.context.type;

        if (this.file) {
            data.file = this.file;
        } else {
            data.file = undefined;
        }


        let permissions = this.members
            .map(m => m.memberid)
            .map(mid => {
                let varName = `member${mid}`;
                let obj: any = {
                    selected: data[varName] || false,
                    memberid: mid
                };
                return obj
            })
            .filter((obj) => {
                return obj.selected
            })
            .map(obj => obj.memberid);

        data.permissions = permissions;

        console.log(JSON.stringify(data));

        // if (data.permissions && typeof data.permissions === 'string') {
        //     data.permissions = data.permissions
        //         .split(',')
        //         .map(m => {
        //             return m.trim().toString();
        //         })
        //         .filter(m => {
        //             return m;
        //         });
        // }

        this.context.formSubmit(data).subscribe(() => {
            this.buttonLoading = false;
            this.closeModal();
        });
    }

    /**
     * @param event
     */
    selectFile(event): void {
        const fileList: FileList = event.target.files;

        if (fileList.length > 0) {
            const file: File = fileList[0];
            const reader: FileReader = new FileReader();

            reader.readAsDataURL(file);

            reader.onload = () => {
                this.file = {
                    name: file.name,
                    blob: reader.result
                };
            };
        }
    }

    selectAll(members) {
        // console.log(`Select all ${members}`);
        this._permissions = this._permissions.map(r => true);
    }

    unselectAll(members) {
        // console.log(`Deselect all ${members}`);
        this._permissions = this._permissions.map(r => false);
    }

    isChecked(memberid) {
        // console.log(`got isChecked() call from ${memberid}`);
        if (this.model.permissions) {
           return this.model.permissions.indexOf(memberid.toString()) !== -1
        } else {
            return false
        }
    }
}
