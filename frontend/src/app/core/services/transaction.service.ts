import { HttpClient } from '@angular/common/http';
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

}
