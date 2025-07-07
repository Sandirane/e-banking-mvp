import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import Keycloak from 'keycloak-js';

interface Action {
  title: string;
  route: string;
}

@Component({
  selector: 'app-menu',
  imports: [CommonModule, RouterLink],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.scss',
})
export class MenuComponent {
  public keycloak = inject(Keycloak);

  actions: Array<Action> = [ 
    { title: 'Comptes', route: '/accounts' },
    { title: 'Transactions', route: '/transactions' },
  ];

  logout() {
    this.keycloak.logout();
  }
}
