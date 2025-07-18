import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import Keycloak from 'keycloak-js';

import { ButtonModule } from 'primeng/button';
import { DrawerModule } from 'primeng/drawer';
import { MenubarModule } from 'primeng/menubar';
import { ToolbarModule } from 'primeng/toolbar';
 
interface Action {
  title: string;
  route: string;
}

@Component({
  selector: 'app-menu',
  imports: [
    CommonModule,
    RouterLink,
    ButtonModule,
    DrawerModule,
    MenubarModule, 
    ToolbarModule
  ],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.scss',
})
export class MenuComponent {
  public keycloak = inject(Keycloak);

  visible: boolean = false;

  actions: Array<Action> = [
    { title: 'Comptes', route: '/accounts' },
    { title: 'Transactions', route: '/transactions' },
    { title: 'Profile', route: '/profile' },
  ];

  items = [
    {
      label: 'Home',
      icon: 'pi pi-home',
    },
    {
      label: 'Profile',
      icon: 'pi pi-home',
    },
    
  ];

  logout() {
    this.keycloak.logout();
  }
}
