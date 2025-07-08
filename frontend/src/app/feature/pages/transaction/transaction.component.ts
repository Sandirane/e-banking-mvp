import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Account } from '@core/models/account';
import { Transaction } from '@core/models/transaction';
import { AccountService } from '@core/services/account.service';
import { TransactionService } from '@core/services/transaction.service';
import { catchError, of, finalize } from 'rxjs';

@Component({
  selector: 'app-transaction',
  imports: [CommonModule, FormsModule],
  templateUrl: './transaction.component.html',
  styleUrl: './transaction.component.scss',
})
export class TransactionComponent implements OnInit {
  private transactionService = inject(TransactionService);
  private accountService = inject(AccountService);

  isLoading = true;
  errorMessage: string | null = null;

  accounts: Account[] = [];
  transactions: Transaction[] = [];

  selectedAccountId!: number;
  type: 'deposit' | 'withdraw' = 'deposit';
  amount = 0;
  description = '';

  editTransactionId?: number;
  editAmount = 0;
  editDesc = '';

  ngOnInit() {
    this.loadAccounts();
    this.loadTransactions();
  }

  private loadAccounts() {
    this.accountService.getAccounts().subscribe((a) => (this.accounts = a));
  }

  loadTransactions() {
    this.isLoading = true;
    this.errorMessage = null;
    this.transactionService
      .getTransactions()
      .pipe(
        catchError((_) => {
          this.errorMessage = 'Impossible de charger les transactions';
          return of([]);
        }),
        finalize(() => (this.isLoading = false))
      )
      .subscribe((t) => (this.transactions = t));
  }

  onCreateTransaction() {
    this.transactionService
      .createTransaction({
        account_id: this.selectedAccountId,
        type: this.type,
        amount: this.amount,
        description: this.description || undefined,
      })
      .subscribe({
        next: (t) => {
          this.transactions.unshift(t);
          this.selectedAccountId = 0;
          this.amount = 0;
          this.description = '';
        },
        error: (err) =>
          (this.errorMessage = err.error?.error || 'Erreur création'),
      });
  }

  startEdit(transaction: Transaction) {
    this.editTransactionId = transaction.id;
    this.editAmount = transaction.amount;
    this.editDesc = transaction.description || '';
  }

  onUpdateTransaction() {
    if (!this.editTransactionId) return;
    this.transactionService
      .updateTransaction(this.editTransactionId, {
        amount: this.editAmount,
        description: this.editDesc,
      })
      .subscribe((updated) => {
        const idx = this.transactions.findIndex((t) => t.id === updated.id);
        if (idx > -1) this.transactions[idx] = updated;
        this.editTransactionId = undefined;
      });
  }
}
