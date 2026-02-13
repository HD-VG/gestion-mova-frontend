import { Component, signal, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { LayoutComponent } from '././layout/layout';

@Component({
  selector: 'app-root',
  imports: [LayoutComponent,RouterOutlet,ButtonModule, ToastModule],
  templateUrl: 'app.html',
  standalone:true,
  styleUrl: './app.css',
    providers: [MessageService]
})
export class App {
  protected readonly title = signal('mi-proyecto-primeng');
   
    
}
