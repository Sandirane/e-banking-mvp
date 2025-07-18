import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FooterComponent } from '@shared/components/footer/footer.component';
import { MenuComponent } from '@shared/components/menu/menu.component';
 
import { CommonModule,  } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    MenuComponent,
    FooterComponent,
    CommonModule, 
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent { 
}
