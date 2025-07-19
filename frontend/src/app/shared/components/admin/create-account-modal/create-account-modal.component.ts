import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Button } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';

export interface CreateAccountData {
  userId: string;
  currency: string;
  balance: number;
}

@Component({
  selector: 'app-create-account-modal',
  imports: [CommonModule, FormsModule, DialogModule, Button],
  templateUrl: './create-account-modal.component.html',
  styleUrl: './create-account-modal.component.scss',
})
export class CreateAccountModalComponent {
  
  @Input() visible = false;
  @Input() users: { id: string; username: string }[] = [];
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() accountCreated = new EventEmitter<CreateAccountData>();
  @Output() cancelled = new EventEmitter<void>();

  formData: CreateAccountData = {
    userId: '',
    currency: 'EUR',
    balance: 0,
  };

  onSubmit() {
    if (this.formData.userId && this.formData.currency) {
      this.accountCreated.emit({ ...this.formData });
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
      userId: '',
      currency: 'EUR',
      balance: 0,
    };
  }

  private closeModal() {
    this.visible = false;
    this.visibleChange.emit(false);
  }
}
