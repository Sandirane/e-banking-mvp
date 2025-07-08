import { CommonModule } from '@angular/common';
import { AccountService } from '@core/services/account.service';
import { tap, catchError, of, finalize } from 'rxjs';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-account',
  imports: [CommonModule, FormsModule],
  templateUrl: './account.component.html',
  styleUrl: './account.component.scss',
})
export class AccountComponent {
  private accountService = inject(AccountService);
  isLoading = true;
  errorMessage: string | null = null;

  newCurrency = 'EUR';
  newBalance = 0;
  editingId?: number;
  editCurrency = '';

  accounts$ = this.accountService.getAccounts().pipe(
    tap(() => (this.errorMessage = null)),
    catchError((err) => {
      this.errorMessage = 'Impossible de charger les comptes.';
      return of([]);
    }),
    finalize(() => (this.isLoading = false))
  );

  addAccount() {
    this.isLoading = true;
    this.accountService
      .createAccount({ balance: this.newBalance, currency: this.newCurrency })
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: () => {
          this.accounts$ = this.accountService.getAccounts();
          this.newBalance = 0;
          this.newCurrency = 'EUR';
        },
        error: () => (this.errorMessage = 'Échec de la création.'),
      });
  }

  removeAccount(id: number) {
    this.accountService.deleteAccount(id).subscribe({
      next: () => {
        this.errorMessage = null;
      },
      error: (err) => {
        this.errorMessage =
          err.error?.error || 'Impossible de clôturer ce compte.';
      },
    });
  }
}
