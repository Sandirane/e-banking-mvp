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
import { MessageService } from 'primeng/api';
import { Toast } from 'primeng/toast';

@Component({
  selector: 'app-accounts-tab',
  imports: [
    CommonModule,
    CardModule,
    AccountTableComponent,
    CreateAccountModalComponent,
    Toast,
  ],
  templateUrl: './accounts-tab.component.html',
  styleUrl: './accounts-tab.component.scss',
})
export class AccountsTabComponent implements OnInit {
  private adminService = inject(AdminService);
  private messageService = inject(MessageService);

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
      .subscribe({
        next: (account) => {
          this.accounts.unshift(account);
          this.showCreateModal = false;

          this.messageService.add({
            severity: 'success',
            summary: 'Compte créé',
            detail: `Le compte de l'utilisateur a été créé.`,
          });
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Erreur',
            detail: `Impossible de créer le compte.`,
          });
        },
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
    this.adminService.updateAccount(id, currency).subscribe({
      next: (updated) => {
        const index = this.accounts.findIndex((a) => a.id === updated.id);
        if (index > -1) this.accounts[index] = updated;

        this.messageService.add({
          severity: 'success',
          summary: 'Compte modifié',
          detail: `La devise du compte a été mise à jour.`,
        });
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: `Échec de la mise à jour.`,
        });
      },
    });
  }

  private deleteAccount(id: number) {
    this.adminService.deleteAccount(id).subscribe({
      next: () => {
        this.accounts = this.accounts.filter((a) => a.id !== id);
        this.messageService.add({
          severity: 'success',
          summary: 'Compte supprimé',
          detail: `Le compte a été supprimé.`,
        });
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: `Impossible de supprimer le compte.`,
        });
      },
    });
  }
}
