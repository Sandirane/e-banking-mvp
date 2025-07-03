import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { Account } from '@core/models/account';
import { Transaction } from '@core/models/transaction';
import { AdminService } from '@core/services/admin.service';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  
  private adminService = inject(AdminService);
  accounts: Account[] = [];
  transactions: Transaction[] = [];

  ngOnInit() {
    this.adminService
      .getAccounts()
      .subscribe((data) => (this.accounts = data));
    this.adminService
      .getTransactions()
      .subscribe((data) => (this.transactions = data));
  }

  onDeleteAccount(id: number) {
    this.adminService.deleteAccount(id).subscribe(() => {
      this.accounts = this.accounts.filter((a) => a.id !== id);
    });
  }

  onDeleteTransaction(id: number) {
    this.adminService.deleteTransaction(id).subscribe(() => {
      this.transactions = this.transactions.filter((t) => t.id !== id);
    });
  }
}
