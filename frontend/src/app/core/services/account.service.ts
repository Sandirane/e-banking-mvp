import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@config/environment';
import { Account } from '@core/models/account';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AccountService {
  
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/accounts`;

  getAccounts(): Observable<Account[]> {
    return this.http.get<Account[]>(this.apiUrl);
  }
  
}
