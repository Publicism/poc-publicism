import { Component, OnInit } from '@angular/core';
import { animate, state, style, transition, trigger } from '@angular/animations';

import { BalanceService } from './balance.service';

@Component({
    selector: 'ngx-app-balance',
    templateUrl: './balance.component.html',
    animations: [
        trigger('visibilityChanged', [
            state('shown', style({opacity: 1})),
            state('hidden', style({opacity: 0})),
            transition('* => *', animate('.5s'))
        ])
    ]
})
export class BalanceComponent implements OnInit {

    /**
     * @type {boolean}
     */
    loading = false;

    /**
     * @type {boolean}
     */
    buttonLoading = false;

    /**
     * @type any
     */
    balanceData = {
        balance: null,
        incoming: null,
        outcoming: null
    };

    /**
     * @type {string}
     */
    balanceVisible = 'shown';

    /**
     * @param {BalanceService} balanceService
     */
    constructor(private balanceService: BalanceService) {
        //
    }

    /**
     *
     */
    ngOnInit(): void {
        this.getBalance();
    }

    /**
     *
     */
    doSettle(): void {
        this.buttonLoading = true;

        this.balanceService
            .settle()
            .subscribe((data: any) => {
                this.balanceVisible = 'hidden';

                setTimeout(() => {
                    this.balanceData = data;
                    this.balanceVisible = 'shown';
                }, 500);

                this.buttonLoading = false;
            });
    }


    /**
     *
     */
    protected getBalance(): void {
        this.loading = true;

        this.balanceService
            .getBalance()
            .subscribe((data: any) => {
                this.balanceData = data;
                this.loading = false;
            });
    }
}
