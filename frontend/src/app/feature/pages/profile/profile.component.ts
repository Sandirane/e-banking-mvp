import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import Keycloak from 'keycloak-js';

import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';

@Component({
  selector: 'app-profile',
  imports: [CommonModule, DividerModule, CardModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent {
  public keycloak = inject(Keycloak);
}
