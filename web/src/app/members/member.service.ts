import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { IMember } from './member';
import { HttpService } from '../http.service';
import { NotificationsService } from 'angular2-notifications/dist';
import 'rxjs/add/operator/map';

@Injectable()
export class MemberService extends HttpService {

    /**
     * @type {string}
     */
    protected baseUrl = '/memberstatuses';

    /**
     * @type {number}
     */
    protected timeout = 10000;

    /**
     * @param {Http} http
     * @param {NotificationsService} notificationService
     */
    constructor(private http: Http,
                protected notificationService: NotificationsService) {
        super(notificationService);
    }

    /**
     * @return {Observable<Array<IMember>>}
     */
    getMembers(): Observable<Array<IMember>> {
        return this.http
            .get(this.baseUrl)
            // .timeout(this.timeout) //todo: find out this timeout's purpose
            .map((resp: Response) => resp.json())
            .catch(err => this.catchErr(err));
    }
}
