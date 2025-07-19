import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Account } from '@core/models/account';
import { Button } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';

export interface CreateTransactionData {
  accountId: number;
  type: 'deposit' | 'withdraw';
  amount: number;
  description: string;
}

@Component({
  selector: 'app-create-transaction-modal',
  imports: [CommonModule, FormsModule, DialogModule, Button],
  templateUrl: './create-transaction-modal.component.html',
  styleUrl: './create-transaction-modal.component.scss'
})
export class CreateTransactionModalComponent {
  @Input() visible = false;
  @Input() accounts: Account[] = [];
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() transactionCreated = new EventEmitter<CreateTransactionData>();
  @Output() cancelled = new EventEmitter<void>();

  formData: CreateTransactionData = {
    accountId: 0,
    type: 'deposit',
    amount: 0,
    description: ''
  };

  onSubmit() {
    if (this.formData.accountId && this.formData.amount) {
      this.transactionCreated.emit({ ...this.formData });
      this.resetForm();
      this.closeModal();
    }
  }

  onCancel() {
    this.resetForm();
    this.closeModal();
    this.cancelled.emit();
  }

  private resetForm() {
    this.formData = {
      accountId: 0,
      type: 'deposit',
      amount: 0,
      description: ''
    };
  }

  private closeModal() {
    this.visible = false;
    this.visibleChange.emit(false);
  }
}