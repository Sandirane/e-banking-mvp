import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Account } from '@core/models/account';
import { Button } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';

export interface AccountEvent {
  type: 'create' | 'update' | 'delete';
  account?: Account;
  data?: any;
}

@Component({
  selector: 'app-account-table',
  imports: [CommonModule, FormsModule, TableModule, Button, InputTextModule],
  templateUrl: './account-table.component.html',
  styleUrl: './account-table.component.scss',
})
export class AccountTableComponent {
  @Input() accounts: Account[] = [];
  @Input() users: { id: string; username: string }[] = [];
  @Output() accountEvent = new EventEmitter<AccountEvent>();

  editAccountId?: number;
  editAccountCurrency = '';

  onCreateAccountClick() {
    this.accountEvent.emit({
      type: 'create'
    });
  }

  startEditAccount(account: Account) {
    this.editAccountId = account.id;
    this.editAccountCurrency = account.currency;
  }

  saveAccount() {
    if (!this.editAccountId) return;
    
    this.accountEvent.emit({
      type: 'update',
      data: {
        id: this.editAccountId,
        currency: this.editAccountCurrency
      }
    });
    
    this.editAccountId = undefined;
    this.editAccountCurrency = '';
  }

  deleteAccount(id: number) {
    this.accountEvent.emit({
      type: 'delete',
      data: { id }
    });
  }
}
