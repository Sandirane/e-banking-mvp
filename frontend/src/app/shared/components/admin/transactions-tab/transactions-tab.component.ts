import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { Account } from '@core/models/account';
import { Transaction } from '@core/models/transaction';
import { AdminService } from '@core/services/admin.service';
import { CardModule } from 'primeng/card';
import {
  CreateTransactionModalComponent,
  CreateTransactionData,
} from '../create-transaction-modal/create-transaction-modal.component';
import {
  TransactionTableComponent,
  TransactionEvent,
} from '../transaction-table/transaction-table.component';
import { MessageService } from 'primeng/api';
import { Toast } from 'primeng/toast';

@Component({
  selector: 'app-transactions-tab',
  imports: [
    CommonModule,
    CardModule,
    TransactionTableComponent,
    CreateTransactionModalComponent,
    Toast,
  ],
  templateUrl: './transactions-tab.component.html',
  styleUrl: './transactions-tab.component.scss',
})
export class TransactionsTabComponent implements OnInit {
  private adminService = inject(AdminService);
  private messageService = inject(MessageService);

  transactions: Transaction[] = [];
  accounts: Account[] = [];
  showCreateModal = false;

  ngOnInit() {
    this.loadTransactions();
    this.loadAccounts();
  }

  onTransactionEvent(event: TransactionEvent) {
    switch (event.type) {
      case 'create':
        this.showCreateModal = true;
        break;
      case 'update':
        this.updateTransaction(
          event.data.id,
          event.data.amount,
          event.data.description
        );
        break;
      case 'delete':
        this.deleteTransaction(event.data.id);
        break;
    }
  }

  onCreateTransaction(data: CreateTransactionData) {
    this.adminService
      .createTransaction(
        data.accountId,
        data.type,
        data.amount,
        data.description
      )
      .subscribe({
        next: (transaction) => {
          this.transactions.unshift(transaction);
          this.showCreateModal = false;

          this.messageService.add({
            severity: 'success',
            summary: 'Transaction créée',
            detail: 'La transaction a été enregistrée avec succès.',
          });
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Erreur',
            detail: 'Impossible de créer la transaction.',
          });
        },
      });
  }

  onCreateModalCancel() {
    this.showCreateModal = false;
  }

  private loadTransactions() {
    this.adminService
      .getTransactions()
      .subscribe((transactions) => (this.transactions = transactions));
  }

  private loadAccounts() {
    this.adminService
      .getAccounts()
      .subscribe((accounts) => (this.accounts = accounts));
  }

  private updateTransaction(id: number, amount: number, description: string) {
    this.adminService.updateTransaction(id, amount, description).subscribe({
      next: (updated) => {
        const index = this.transactions.findIndex((t) => t.id === updated.id);
        if (index > -1) this.transactions[index] = updated;

        this.messageService.add({
          severity: 'success',
          summary: 'Transaction mise à jour',
          detail: 'La transaction a été modifiée.',
        });
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Échec de la mise à jour de la transaction.',
        });
      },
    });
  }

  private deleteTransaction(id: number) {
    this.adminService.deleteTransaction(id).subscribe({
      next: () => {
        this.transactions = this.transactions.filter((t) => t.id !== id);
        this.messageService.add({
          severity: 'success',
          summary: 'Transaction supprimée',
          detail: 'La transaction a été supprimée.',
        });
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Impossible de supprimer la transaction.',
        });
      },
    });
  }
}
