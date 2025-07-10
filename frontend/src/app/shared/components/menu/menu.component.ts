import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import Keycloak from 'keycloak-js';

import { ButtonModule } from 'primeng/button';

interface Action {
  title: string;
  route: string;
}

@Component({
  selector: 'app-menu',
  imports: [CommonModule, RouterLink, ButtonModule],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.scss',
})
export class MenuComponent {
  public keycloak = inject(Keycloak);

  actions: Array<Action> = [
    { title: 'Comptes', route: '/accounts' },
    { title: 'Transactions', route: '/transactions' },
    { title: 'Profile', route: '/profile' },
  ];

  logout() {
    this.keycloak.logout();
  }
}
