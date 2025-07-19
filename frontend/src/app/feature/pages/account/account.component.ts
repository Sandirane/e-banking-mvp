import { CommonModule } from '@angular/common';
import { AccountService } from '@core/services/account.service';
import { tap, catchError, of, finalize } from 'rxjs';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
import { Button } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { Message } from 'primeng/message';

import { Toast } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-account',
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
  templateUrl: './account.component.html',
  styleUrl: './account.component.scss',
})
export class AccountComponent {
  private accountService = inject(AccountService);
  private messageService = inject(MessageService);

  isLoading = true;
  errorMessage: string | null = null;

  newCurrency = 'EUR';
  newBalance = 0;
  editingId?: number;
  editCurrency = '';

  displayModal = false;

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
          this.displayModal = false;
          this.messageService.add({
            severity: 'success',
            summary: 'Succès',
            detail: 'Compte créé avec succès !',
          });
        },
        error: () => {
          this.errorMessage = 'Échec de la création.';
          this.messageService.add({
            severity: 'error',
            summary: 'Erreur',
            detail: 'Échec de la création du compte.',
          });
        },
      });
  }

  removeAccount(id: number) {
    this.accountService.deleteAccount(id).subscribe({
      next: () => {
        this.accounts$ = this.accountService.getAccounts();
        this.errorMessage = null;
        this.messageService.add({
          severity: 'success',
          summary: 'Compte supprimé',
          detail: `Le compte #${id} a été supprimé.`,
        });
      },
      error: (err) => {
        this.errorMessage =
          err.error?.error || 'Impossible de clôturer ce compte.';
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail:
            this.errorMessage || `Impossible de clôturer le compte #${id}`,
        });
      },
    });
  }
}
