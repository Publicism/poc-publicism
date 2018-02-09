import { Observable } from 'rxjs/Observable';
import { TimeoutError } from 'rxjs/Rx';
import { NotificationsService } from 'angular2-notifications/dist';
import { Response } from '@angular/http';

import 'rxjs/add/observable/empty';

export class HttpService {

    /**
     * @param {NotificationsService} notificationService
     */
    constructor(protected notificationService: NotificationsService) {
        //
    }

    /**
     * @param {any} err
     * @return {any}
     */
    protected catchErr(err: any): any {
        let msg;

        if (err instanceof Response) {
            msg = err.text();
        } else if (err instanceof TimeoutError) {
            msg = err.message;
        } else {
            msg = 'Unknown error';
        }

        this.notificationService.error('Error', msg);

        return Observable.empty();
    }
}
