import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { NotificationsService } from 'angular2-notifications/dist';
import { HttpService } from '../http.service';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/share';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/timeout';
import 'rxjs/add/observable/empty';

@Injectable()
export class DataObjectService extends HttpService {

    /**
     * @type {string}
     */
    protected baseUrl = '';

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
     * @return {Observable<Array<any>>}
     */
    getRequestHistory(): Observable<Array<any>> {
        return this.http
            .get(`${this.baseUrl}/dorequests`)
            .map((resp: Response) => resp.json());
    }

    /**
     * @return {Observable<Array<any>>}
     */
    getMyDOs(): Observable<Array<any>> {
        return this.http
            .get(`${this.baseUrl}/members/me/dos/all`)
            .timeout(this.timeout)
            .map((resp: Response) => {
                const json = resp.json();

                json.forEach(dataObject => {
                    dataObject.unique = this.getRandomInt();
                });

                return json;
            })
            .catch(err => this.catchErr(err));
    }

    /**
     * This method returns Data Objects from member with specified id
     *
     * @return {Observable<Array<any>>}
     */
    getMemberDOs(id: number | string): Observable<Array<any>> {
        return this.http
            .get(`${this.baseUrl}/members/${id}/dos/all`)
            .timeout(this.timeout)
            .map((resp: Response) => {
                const json = resp.json();

                json.forEach(dataObject => {
                    dataObject.unique = this.getRandomInt();
                });

                return json;
            })
            .catch(err => this.catchErr(err));
    }

    /**
     * @param {any} objectId
     * @return {Observable<Array<any>>}
     */
    getDORequestDetails(objectId: any): Observable<Array<any>> {
        return this.http
            .get(`${this.baseUrl}/dorequests/${objectId}`)
            .timeout(this.timeout)
            .map((resp: Response) => {
                return resp.json();
            })
            .catch(err => this.catchErr(err))
            .share();
    }

    /**
     * @param {string} type
     * @param {any} file
     * @param {string} content
     * @param {string} name
     * @param {number} price
     * @param {Array<string>} permissions
     * @return {Observable<any>}
     */
    addDO(type: string,
          file?: any,
          content?: string,
          name?: string,
          price?: number,
          permissions?: Array<string>): Observable<any> {
        const data = {type, file, content, name, price, permissions};

        return this.http
            .post(`${this.baseUrl}/dos`, data)
            .timeout(this.timeout)
            .map((resp: Response) => {
                this.notificationService.success('Success', 'Data object created.');

                return resp.json();
            })
            .catch(err => this.catchErr(err))
            .share();
    }

    /**
     * @param {number} id
     * @param {string} type
     * @param {any} file
     * @param {string} content
     * @param {string} name
     * @param {number} price
     * @param {Array<string>} permissions
     * @return {Observable<any>}
     */
    updateDO(id: number,
             type: string,
             file?: any,
             content?: string,
             name?: string,
             price?: number,
             permissions?: Array<string>): Observable<any> {
        const data = {type, file, content, name, price, permissions};

        return this.http
            .post(`${this.baseUrl}/dos/${id}`, data)
            // .timeout(this.timeout) //we should consider something about this timeout cause 30 secs is not enough
            .map((resp: Response) => {
                this.notificationService.success('Success', 'Data object updated.');

                return resp;
            })
            .catch(err => this.catchErr(err))
            .share();
    }

    /**
     * @param {any} doid
     * @param {string} token
     * @return {Observable<any>}
     */
    requestDO(doid: any, token?: string): Observable<any> {
        return this.http
            .post(`${this.baseUrl}/dorequests`, {doid, token})
            //.timeout(this.timeout)
            .map((resp: Response) => {
                return resp.json();
            })
            .catch(err => this.catchErr(err))
            .share();
    }

    /**
     * @param {any} doid
     * @return {Observable<any>}
     */
    requestDOPrice(doid: any): Observable<any> {
        return this.http
            .post(`${this.baseUrl}/pricerequests`, {doid})
            //.timeout(this.timeout)
            .map((resp: Response) => {
                return resp.json();
            })
            .catch(err => this.catchErr(err))
            .share();
    }

    /**
     * @todo Move this method to sepeate service
     * @param {any} doid
     * @param {any} memberid
     * @param {number} price
     * @return {Observable<any>}
     */
    makePayment(doid: any, memberid: any, price: number): Observable<any> {
        return this.http
            .post(`${this.baseUrl}/balance/pay`, {doid, memberid, price})
            //.timeout(this.timeout)
            .map((resp: Response) => {
                return resp.json();
            })
            .catch(err => this.catchErr(err))
            .share();
    }

    /**
     * @param {number} min
     * @param {number} max
     * @return {number}
     */
    protected getRandomInt(min = 1000, max = 1000000): number {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
}
