import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MonitorAccountComponent } from '@shared/components/monitor-account/monitor-account.component';
import Keycloak from 'keycloak-js';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-home',
  imports: [CardModule, CommonModule, ButtonModule, MonitorAccountComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  public keycloak = inject(Keycloak);
}
