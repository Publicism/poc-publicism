import { Component } from '@angular/core';
import { Router, RoutesRecognized } from '@angular/router';

@Component({
    selector: 'ngx-app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent {

    /**
     * @type {any}
     */
    notificationOptions: any = {
        timeOut: 3000,
        lastOnBottom: true
    };

    /**
     * @type {any}
     */
    currentPath: any;

    /**
     * @param {Router} router
     */
    constructor(private router: Router) {
        this.router.events.subscribe(data => {
            if (data instanceof RoutesRecognized) {
                const route = data.state.root.firstChild;

                this.currentPath = route.routeConfig.path;
            }
        });
    }
}
