import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  inject,
  ViewChild,
} from '@angular/core';
import { AccountService } from '@core/services/account.service'; 

import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';

import { tap, catchError, of, finalize } from 'rxjs'; 

@Component({
  selector: 'app-monitor-account',
  imports: [CommonModule, CardModule, ChartModule],
  templateUrl: './monitor-account.component.html',
  styleUrl: './monitor-account.component.scss',
})
export class MonitorAccountComponent {
  @ViewChild('chartCanvas') chartCanvas!: ElementRef;

  private accountService = inject(AccountService);

  isLoading = true;
  errorMessage: string | null = null;

  chartData: any;
  chartOptions: any;

  accounts$ = this.accountService.getAccounts().pipe(
    tap(() => (this.errorMessage = null)),
    catchError((err) => {
      this.errorMessage = 'Impossible de charger les comptes.';
      return of([]);
    }),
    finalize(() => (this.isLoading = false))
  );

  ngOnInit() {
    this.accounts$.subscribe((accounts) => {
      const labels = accounts.map((acc) => 'Compte #' + acc.id);
      const data = accounts.map((acc) => acc.balance);

      this.chartData = {
        labels,
        datasets: [
          {
            data,
            backgroundColor: [
              '#42A5F5',
              '#66BB6A',
              '#FFA726',
              '#AB47BC',
              '#FF7043',
            ],
          },
        ],
      };

      this.chartOptions = {
        responsive: true,
        plugins: {
          legend: {
            position: 'bottom',
          },
        },
      };
    });
  }
}
