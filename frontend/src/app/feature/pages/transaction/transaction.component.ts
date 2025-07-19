import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Account } from '@core/models/account';
import { Transaction } from '@core/models/transaction';
import { AccountService } from '@core/services/account.service';
import { TransactionService } from '@core/services/transaction.service';
import { Button } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { catchError, of, finalize } from 'rxjs';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { Message } from 'primeng/message';

import { Toast } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-transaction',
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    InputTextModule,
    CardModule,
    DialogModule,
    Button,
    ProgressSpinnerModule,
    Message,
    Toast,
  ],
  templateUrl: './transaction.component.html',
  styleUrl: './transaction.component.scss',
})
export class TransactionComponent implements OnInit {
  private transactionService = inject(TransactionService);
  private accountService = inject(AccountService);
  private messageService = inject(MessageService);

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

  displayModal = false;

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
          this.displayModal = false;
          this.messageService.add({
            severity: 'success',
            summary: 'Succès',
            detail: 'La transaction a été créé avec succès !',
          });
        },
        error: (err) => {
          this.errorMessage = 'Échec de la transaction.';
          this.messageService.add({
            severity: 'error',
            summary: 'Erreur',
            detail: 'Échec de la transaction.',
          });
        },
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
      .subscribe({
        next: (updated) => {
          const idx = this.transactions.findIndex((t) => t.id === updated.id);
          if (idx > -1) this.transactions[idx] = updated;
          this.editTransactionId = undefined;

          this.messageService.add({
            severity: 'success',
            summary: 'Mise à jour',
            detail: 'La transaction a été mise à jour avec succès.',
          });
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Erreur',
            detail: 'Impossible de mettre à jour la transaction.',
          });
        },
      });
  }
}
