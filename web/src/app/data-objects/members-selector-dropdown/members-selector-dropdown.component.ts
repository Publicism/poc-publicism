import { Component, forwardRef, OnDestroy, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { MemberService } from '../../members/member.service';
import { IMember } from "../../members/member";

@Component({
  selector: 'app-members-selector-dropdown',
  templateUrl: './members-selector-dropdown.component.html',
  styleUrls: ['./members-selector-dropdown.component.scss'],
  providers: []
})
export class MembersSelectorDropdownComponent implements OnInit, OnDestroy {

  @Input() members:Array<any>;
  @Output() onSelectedMember: EventEmitter<any> = new EventEmitter<any>();

  private value:any = {};
  private _disabledV:string = '0';
  private disabled:boolean = false;
  private items:Array<any> = [];

  private get disabledV():string {
    return this._disabledV;
  }

  private set disabledV(value:string) {
    this._disabledV = value;
    this.disabled = this._disabledV === '1';
  }

  private selected(value:any) {
    console.log('Selected value is: ', value);
  }

  private removed(value:any) {
    console.log('Removed value is: ', value);
  }

  private typed(value:any) {
    console.log('New search input: ', value);
  }

  private refreshValue(value:any) {
    this.value = value;
  }

  protected doSearch(param: any): void {
    this.onSelectedMember.emit(param)
  }

  ngOnInit(): void {
    console.log(`Got members in dropdown component... ${JSON.stringify(this.members)}`);
    this.items = this.members;
  }

  ngOnDestroy(): void {
    
  }
}
