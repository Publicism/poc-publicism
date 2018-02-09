import { Component, OnInit } from '@angular/core';
import { MemberService } from './member.service';
import { IMember } from './member';

@Component({
    selector: 'ngx-app-members',
    templateUrl: './members.component.html'
})
export class MembersComponent implements OnInit {

    /**
     * @type {Array<IMember>}
     */
    members: Array<IMember> = [];

    /**
     * @type {boolean}
     */
    tableLoading = false;

    /**
     * @param {MemberService} memberService
     */
    constructor(private memberService: MemberService) {
        //
    }

    /**
     *
     */
    ngOnInit(): void {
        this.getMembers();
    }

    /**
     * @param {IMember} member
     * @return {string}
     */
    getBadgeClass(member: IMember): string {
        return member.memberstatus === 'Online' ? 'badge-primary' : 'badge-danger';
    }

    /**
     *
     */
    protected getMembers(): void {
        this.tableLoading = true;

        this.memberService
            .getMembers()
            .subscribe((members: Array<IMember>) => {
                this.members = members;
                this.tableLoading = false;
            });
    }
}
