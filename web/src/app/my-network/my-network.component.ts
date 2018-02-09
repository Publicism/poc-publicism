import { Component, OnInit } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';

@Component({
    selector: 'ngx-app-my-network',
    templateUrl: './my-network.component.html',
    styleUrls: ['./my-network.component.scss']
})
export class MyNetworkComponent implements OnInit {

    /**
     * @type {Array<any>}
     */
    networkChecks: Array<any> = [];
    /**
     * @type {string}
     */
    protected baseUrl = '';
    /**
     * @type {number}
     */
    protected timeout = 10000;

    /**
     * @param {Http} http
     */
    constructor(private http: Http) {
        //
    }

    /**
     *
     */
    ngOnInit(): void {
        this.http
            .get(`${this.baseUrl}/systemchecks`)
            .timeout(this.timeout)
            .map(resp => resp.json())
            .subscribe(response => {
                this.networkChecks = response;
            });
    }

    /**
     * @param {any} check
     * @return {string}
     */
    getBadgeClass(check: any): string {
        switch (check.checkstatus) {
            case 'ERROR':
                return 'badge-danger';
            case 'WARNING':
                return 'badge-warning';
            default:
                return 'badge-primary';
        }
    }
}
