import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'ngx-app-pagenotfound',
    templateUrl: './pagenotfound.component.html',
    styleUrls: ['./pagenotfound.component.scss']
})
export class PagenotfoundComponent implements OnInit {

    /**
     *
     */
    constructor() {
        const body = document.getElementsByTagName('body')[0];

        body.classList.add('gray-bg');
    }

    /**
     *
     */
    ngOnInit(): void {
        //
    }

}
