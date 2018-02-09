import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { NotificationsService } from 'angular2-notifications/dist';
import 'rxjs/add/operator/map';

import { HttpService } from '../http.service';

@Injectable()
export class BalanceService extends HttpService {

    /**
     * @type {string}
     */
    protected baseUrl = '/balance';

    /**
     * @type {number}
     */
    protected timeout = 30000;

    /**
     * @param {Http} http
     * @param {NotificationsService} notificationService
     */
    constructor(private http: Http,
                protected notificationService: NotificationsService) {
        super(notificationService);
    }

    /**
     * @return {Observable<any>}
     */
    getBalance(): Observable<any> {
        return this.http
            .get(`${this.baseUrl}/current`)
            //.timeout(this.timeout)
            .map((resp: Response) => resp.json())
            .catch(err => this.catchErr(err));
    }

    /**
     * @return {Observable<any>}
     */
    settle(): Observable<any> {
        return this.http
            .post(`${this.baseUrl}/settle`, null)
            //.timeout(this.timeout)
            .map((resp: Response) => resp.json())
            .catch(err => this.catchErr(err));
    }
}
