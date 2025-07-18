import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';

@Component({
  selector: 'app-pagenotfound',
  imports: [ButtonModule, MessageModule],
  templateUrl: './pagenotfound.component.html',
  styleUrl: './pagenotfound.component.scss',
})
export class PagenotfoundComponent {}
