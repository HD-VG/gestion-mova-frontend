import { Component,inject } from '@angular/core';
import { Router } from '@angular/router';
import { AvatarModule } from 'primeng/avatar';
import { RippleModule } from 'primeng/ripple';
import { CommonModule } from '@angular/common';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
@Component({
  selector: 'layout-component',
  standalone: true,
  templateUrl: './layout.html',
  styleUrl: './layout.scss',
  imports: [CommonModule, AvatarModule, RippleModule, ButtonModule, ToastModule],
})

export class LayoutComponent {
  menuOpen = false;
  isDarkMode = false;
  private router = inject(Router);
  private messageService = inject(MessageService);

  isMobile() {
    return window.innerWidth <= 768;
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  toggleDarkMode() {
    const element = document.querySelector('html');
    if (element) {
      element.classList.toggle('my-app-dark');
      this.isDarkMode = element.classList.contains('my-app-dark');
    }
  }

  navigate(path: string) {
    this.router.navigate([path]);
    this.menuOpen = false;
  }

  goInicio() { this.navigate(''); }
  goTienda() { this.navigate('/tienda'); }
  goUbicanos() { this.navigate('/ubicaciones'); }
  goCarrito() { this.navigate('/carrito'); }
  goUser() {
  const token = localStorage.getItem('auth_token');
  
  if (token) {
    this.router.navigate(['/user']);
  } else {
    this.router.navigate(['/login-register']);
  }
}
}