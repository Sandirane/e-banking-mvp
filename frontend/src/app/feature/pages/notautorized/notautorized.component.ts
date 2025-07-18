import { Component } from '@angular/core';
import { MessageModule } from 'primeng/message';

@Component({
  selector: 'app-notautorized',
  imports: [MessageModule],
  templateUrl: './notautorized.component.html',
  styleUrl: './notautorized.component.scss',
})
export class NotautorizedComponent {}
