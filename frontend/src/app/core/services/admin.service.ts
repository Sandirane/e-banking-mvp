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
  private accountsUrl = `${environment.apiUrl}/api/admin/accounts`;
  private txUrl = `${environment.apiUrl}/api/admin/transactions`;

  getAccounts(userId?: string): Observable<Account[]> {
    let params = new HttpParams();
    if (userId) {
      params = params.set('userId', userId);
    }
    return this.http.get<Account[]>(this.accountsUrl, { params });
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
    return this.http.get<Transaction[]>(this.txUrl, { params });
  }

  deleteTransaction(id: number): Observable<void> {
    return this.http.delete<void>(`${this.txUrl}/${id}`);
  }
}
