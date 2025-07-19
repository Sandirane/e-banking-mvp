import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { Account } from '@core/models/account';
import { Transaction } from '@core/models/transaction';
import { AdminService } from '@core/services/admin.service';
import { CardModule } from 'primeng/card';
import { CreateTransactionModalComponent, CreateTransactionData } from '../create-transaction-modal/create-transaction-modal.component';
import { TransactionTableComponent, TransactionEvent } from '../transaction-table/transaction-table.component';

@Component({
  selector: 'app-transactions-tab',
  imports: [
    CommonModule,
    CardModule,
    TransactionTableComponent,
    CreateTransactionModalComponent,
  ],
  templateUrl: './transactions-tab.component.html',
  styleUrl: './transactions-tab.component.scss',
})
export class TransactionsTabComponent implements OnInit {
  private adminService = inject(AdminService);

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
      .subscribe((transaction) => {
        this.transactions.unshift(transaction);
        this.showCreateModal = false;
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
    this.adminService
      .updateTransaction(id, amount, description)
      .subscribe((updated) => {
        const index = this.transactions.findIndex((t) => t.id === updated.id);
        if (index > -1) {
          this.transactions[index] = updated;
        }
      });
  }

  private deleteTransaction(id: number) {
    this.adminService.deleteTransaction(id).subscribe(() => {
      this.transactions = this.transactions.filter((t) => t.id !== id);
    });
  }
}
