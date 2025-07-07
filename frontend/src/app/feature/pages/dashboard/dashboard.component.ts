import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Account } from '@core/models/account';
import { Transaction } from '@core/models/transaction';
import { AdminService } from '@core/services/admin.service';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  private adminService = inject(AdminService);

  accounts: Account[] = [];
  transactions: Transaction[] = [];

  newAccountUserId = '';
  newAccountCurrency = 'EUR';
  newAccountBalance = 0;

  editAccountId?: number;
  editAccountCurrency = '';

  newTransactionAccountId = 0;
  newTransactionType: 'deposit' | 'withdraw' = 'deposit';
  newTransactionAmount = 0;
  newTransactionDesc = '';

  editTransactionId?: number;
  editTransactionAmount = 0;
  editTransactionDesc = '';

  users: { id: string; username: string }[] = [];

  ngOnInit() {
    this.adminService
      .getAccounts()
      .subscribe((account) => (this.accounts = account));
    this.adminService
      .getTransactions()
      .subscribe((transaction) => (this.transactions = transaction));
    this.adminService.getUsers().subscribe((u) => (this.users = u));
  }

  onCreateAccount() {
    this.adminService
      .createAccount(
        this.newAccountUserId,
        this.newAccountCurrency,
        this.newAccountBalance
      )
      .subscribe((acc) => {
        this.accounts.unshift(acc);
        this.newAccountUserId = '';
        this.newAccountCurrency = 'EUR';
        this.newAccountBalance = 0;
      });
  }

  startEditAccount(acc: Account) {
    this.editAccountId = acc.id;
    this.editAccountCurrency = acc.currency;
  }
  onUpdateAccount() {
    if (!this.editAccountId) return;
    this.adminService
      .updateAccount(this.editAccountId, this.editAccountCurrency)
      .subscribe((updated) => {
        const i = this.accounts.findIndex((a) => a.id === updated.id);
        if (i > -1) this.accounts[i] = updated;
        this.editAccountId = undefined;
      });
  }

  onDeleteAccount(id: number) {
    this.adminService.deleteAccount(id).subscribe(() => {
      this.accounts = this.accounts.filter((a) => a.id !== id);
    });
  }

  onCreateTransaction() {
    this.adminService
      .createTransaction(
        this.newTransactionAccountId,
        this.newTransactionType,
        this.newTransactionAmount,
        this.newTransactionDesc
      )
      .subscribe((transaction) => {
        this.transactions.unshift(transaction);
        this.newTransactionAccountId = 0;
        this.newTransactionType = 'deposit';
        this.newTransactionAmount = 0;
        this.newTransactionDesc = '';
      });
  }

  startEditTransaction(transaction: Transaction) {
    this.editTransactionId = transaction.id;
    this.editTransactionAmount = transaction.amount;
    this.editTransactionDesc = transaction.description || '';
  }

  onUpdateTransaction() {
    if (!this.editTransactionId) return;
    this.adminService
      .updateTransaction(
        this.editTransactionId,
        this.editTransactionAmount,
        this.editTransactionDesc
      )
      .subscribe((updated) => {
        const idx = this.transactions.findIndex((t) => t.id === updated.id);
        if (idx > -1) this.transactions[idx] = updated;
        this.editTransactionId = undefined;
      });
  }

  onDeleteTransaction(id: number) {
    this.adminService.deleteTransaction(id).subscribe(() => {
      this.transactions = this.transactions.filter((t) => t.id !== id);
    });
  }
}
