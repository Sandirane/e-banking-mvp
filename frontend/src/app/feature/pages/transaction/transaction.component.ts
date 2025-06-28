import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { TransactionService } from '@core/services/transaction.service';

@Component({
  selector: 'app-transaction',
  imports: [CommonModule],
  templateUrl: './transaction.component.html',
  styleUrl: './transaction.component.scss',
})
export class TransactionComponent {
  private transactionService = inject(TransactionService);
  transactions$ = this.transactionService.getTransactions();
}
