import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@config/environment';
import { Transaction } from '@core/models/transaction';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TransactionService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/transactions`;

  getTransactions(): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(this.apiUrl);
  }

  getAllTransactions(accountId?: number): Observable<Transaction[]> {
    let params = new HttpParams();
    if (accountId != null) {
      params = params.set('account_id', accountId.toString());
    }
    return this.http.get<Transaction[]>(this.apiUrl, { params });
  }
 
  getTransaction(id: number): Observable<Transaction> {
    return this.http.get<Transaction>(`${this.apiUrl}/${id}`);
  }
 
  createTransaction(payload: {
    account_id: number;
    type: 'deposit' | 'withdraw';
    amount: number;
    description?: string;
  }): Observable<Transaction> {
    return this.http.post<Transaction>(this.apiUrl, payload);
  }
 
  updateTransaction(
    id: number,
    updates: {
      amount?: number;
      description?: string;
    }
  ): Observable<Transaction> {
    return this.http.put<Transaction>(`${this.apiUrl}/${id}`, updates);
  }
 
  deleteTransaction(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
  
}
