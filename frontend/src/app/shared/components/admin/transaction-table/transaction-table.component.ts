import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Account } from '@core/models/account';
import { Transaction } from '@core/models/transaction';
import { Button } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';

export interface TransactionEvent {
  type: 'create' | 'update' | 'delete';
  transaction?: Transaction;
  data?: any;
}

@Component({
  selector: 'app-transaction-table',
  imports: [CommonModule, FormsModule, TableModule, Button, InputTextModule],
  templateUrl: './transaction-table.component.html',
  styleUrl: './transaction-table.component.scss'
})
export class TransactionTableComponent {
  @Input() transactions: Transaction[] = [];
  @Input() accounts: Account[] = [];
  @Output() transactionEvent = new EventEmitter<TransactionEvent>();

  editTransactionId?: number;
  editTransactionAmount = 0;
  editTransactionDesc = '';

  onCreateTransactionClick() {
    this.transactionEvent.emit({ type: 'create' });
  }

  startEditTransaction(transaction: Transaction) {
    this.editTransactionId = transaction.id;
    this.editTransactionAmount = transaction.amount;
    this.editTransactionDesc = transaction.description || '';
  }

  saveTransaction() {
    if (!this.editTransactionId) return;
    
    this.transactionEvent.emit({
      type: 'update',
      data: {
        id: this.editTransactionId,
        amount: this.editTransactionAmount,
        description: this.editTransactionDesc
      }
    });
    
    this.editTransactionId = undefined;
  }

  deleteTransaction(id: number) {
    this.transactionEvent.emit({
      type: 'delete',
      data: { id }
    });
  }
}