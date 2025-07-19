import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { Account } from '@core/models/account';
import { AdminService } from '@core/services/admin.service';
import { CardModule } from 'primeng/card';
import {
  AccountTableComponent,
  AccountEvent,
} from '../account-table/account-table.component';
import {
  CreateAccountModalComponent,
  CreateAccountData,
} from '../create-account-modal/create-account-modal.component';

@Component({
  selector: 'app-accounts-tab',
  imports: [
    CommonModule,
    CardModule,
    AccountTableComponent,
    CreateAccountModalComponent,
  ],
  templateUrl: './accounts-tab.component.html',
  styleUrl: './accounts-tab.component.scss',
})
export class AccountsTabComponent implements OnInit {
  private adminService = inject(AdminService);

  accounts: Account[] = [];
  users: { id: string; username: string }[] = [];
  showCreateModal = false;

  ngOnInit() {
    this.loadAccounts();
    this.loadUsers();
  }

  onAccountEvent(event: AccountEvent) {
    switch (event.type) {
      case 'create':
        this.showCreateModal = true;
        break;
      case 'update':
        this.updateAccount(event.data.id, event.data.currency);
        break;
      case 'delete':
        this.deleteAccount(event.data.id);
        break;
    }
  }

  onCreateAccount(data: CreateAccountData) {
    this.adminService
      .createAccount(data.userId, data.currency, data.balance)
      .subscribe((account) => {
        this.accounts.unshift(account);
        this.showCreateModal = false;
      });
  }

  onCreateModalCancel() {
    this.showCreateModal = false;
  }

  private loadAccounts() {
    this.adminService
      .getAccounts()
      .subscribe((accounts) => (this.accounts = accounts));
  }

  private loadUsers() {
    this.adminService.getUsers().subscribe((users) => (this.users = users));
  }

  private updateAccount(id: number, currency: string) {
    this.adminService.updateAccount(id, currency).subscribe((updated) => {
      const index = this.accounts.findIndex((a) => a.id === updated.id);
      if (index > -1) {
        this.accounts[index] = updated;
      }
    });
  }

  private deleteAccount(id: number) {
    this.adminService.deleteAccount(id).subscribe(() => {
      this.accounts = this.accounts.filter((a) => a.id !== id);
    });
  }
}
