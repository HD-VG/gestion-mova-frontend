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
// ... (tus otros imports)

export class LayoutComponent {
  menuOpen = false;
  isDarkMode = false;
  private router = inject(Router);
  private messageService = inject(MessageService);

  // Detectar si es móvil para el menú
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

  // Navegación genérica que cierra el menú móvil
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