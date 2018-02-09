import { Http } from '@angular/http';
import { Injectable } from '@angular/core';

@Injectable()
export class UtilityService {

    /**
     * @type {any}
     */
    protected memberId = undefined;

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
     * @param {function} callback
     */
    getCurrentMemberId(callback): void {
        if (this.memberId !== undefined) {
            callback(this.memberId);
        } else {
            this.http
                .get(`${this.baseUrl}/memberid`)
                .timeout(this.timeout)
                .map(resp => resp.json())
                .subscribe(
                    response => {
                        this.memberId = response.currentMemberId;

                        callback(this.memberId);
                    }
                );
        }
    }
}
