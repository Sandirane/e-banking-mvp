import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@config/environment';
import { Account } from '@core/models/account';
import { Transaction } from '@core/models/transaction';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private http = inject(HttpClient);
  private api = `${environment.apiUrl}/api/admin`;
  private accountsUrl = `${environment.apiUrl}/api/admin/accounts`;
  private transactionUrl = `${environment.apiUrl}/api/admin/transactions`;

  getAccounts(userId?: string): Observable<Account[]> {
    let params = new HttpParams();
    if (userId) {
      params = params.set('userId', userId);
    }
    return this.http.get<Account[]>(this.accountsUrl, { params });
  }

  createAccount(
    userId: string,
    currency: string,
    initialBalance = 0
  ): Observable<Account> {
    return this.http.post<Account>(`${this.accountsUrl}`, {
      userId,
      currency,
      balance: initialBalance,
    });
  }

  updateAccount(id: number, currency: string): Observable<Account> {
    return this.http.put<Account>(`${this.accountsUrl}/${id}`, {
      currency,
    });
  }

  deleteAccount(id: number): Observable<void> {
    return this.http.delete<void>(`${this.accountsUrl}/${id}`);
  }

  getTransactions(
    userId?: string,
    accountId?: number
  ): Observable<Transaction[]> {
    let params = new HttpParams();
    if (userId) {
      params = params.set('userId', userId);
    }
    if (accountId != null) {
      params = params.set('accountId', accountId.toString());
    }
    return this.http.get<Transaction[]>(this.transactionUrl, { params });
  }

  createTransaction(
    accountId: number,
    type: 'deposit' | 'withdraw',
    amount: number,
    description?: string
  ): Observable<Transaction> {
    return this.http.post<Transaction>(`${this.transactionUrl}`, {
      account_id: accountId,
      type,
      amount,
      description,
    });
  }

  updateTransaction(
    id: number,
    amount?: number,
    description?: string
  ): Observable<Transaction> {
    return this.http.put<Transaction>(`${this.transactionUrl}/${id}`, {
      amount,
      description,
    });
  }

  deleteTransaction(id: number): Observable<void> {
    return this.http.delete<void>(`${this.transactionUrl}/${id}`);
  }

  getUsers(): Observable<{ id: string; username: string }[]> {
    return this.http.get<{ id: string; username: string }[]>(
      `${this.api}/users`
    );
  }
}
