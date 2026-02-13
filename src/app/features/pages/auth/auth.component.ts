import { Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { environment } from '../../../../environments/environment';

import { DialogModule } from 'primeng/dialog';
import { RadioButtonModule } from 'primeng/radiobutton';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { DividerModule } from 'primeng/divider';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

declare const google: any;

@Component({
  standalone: true,
  selector: 'app-auth',
  imports: [
    CommonModule,
    FormsModule,
    DialogModule,
    RadioButtonModule,
    ButtonModule,
    InputTextModule,
    PasswordModule,
    DividerModule,
    ToastModule,
  ],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.scss',
  providers: [MessageService],
})
export class AuthComponent implements OnInit {
  private authService = inject(AuthService);
  private messageService = inject(MessageService);
  private platformId = inject(PLATFORM_ID);
  private router = inject(Router);

  // Login / Register 
  isLogin = true;
  loading = false;
  registerLoading = false;
  registerError = '';
  email = '';
  password = '';
  fullName = '';

  // Recuperación
  showForgotDialog = false;
  recoveryStep: 'email' | 'method' | 'code' | 'security' | 'success' = 'email';
  recoveryMethod: 'email' | 'security' = 'email';
  forgotEmail = '';
  securityQuestion = '';
  securityAnswer = '';
  resetCode = '';
  newPassword = '';
  confirmPassword = '';
  codeSent = false;
  userFound = false;

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.loadGoogleScript();
    }
  }

  toggleForm() {
    this.isLogin = !this.isLogin;
    this.registerError = '';
    this.resetRecoveryForm();
  }

  // Lógica de Login
  login(): void {
    if (!this.email || !this.password) {
      this.showToast('warn', 'Completa correo y contraseña');
      return;
    }
    this.loading = true;
    this.authService.login(this.email, this.password).subscribe({
      next: (res: any) => {
        if (res.success === true) {
          const token = res.data?.access_token || res.access_token;
          if (token) {
            localStorage.setItem('auth_token', token);
            if (res.data?.user) {
              localStorage.setItem('current_user', JSON.stringify(res.data.user));
            }
            this.showToast('success', '¡Bienvenido de nuevo!');
            this.router.navigate(['/user']);
          }
        } else {
          this.showToast('error', res.message || 'Error al entrar');
        }
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.showToast('error', err.error?.message || 'Credenciales inválidas');
      }
    });
  }

  // Lógica de Registro
  register() {
    if (!this.fullName || !this.email || !this.password) {
      this.showToast('warn', 'Todos los campos son obligatorios');
      return;
    }
    this.registerLoading = true;
    const data = { role: 'CLIENTE', fullName: this.fullName.trim(), email: this.email.trim(), password: this.password };
    
    this.authService.register(data).subscribe({
      next: () => {
        this.showToast('success', '¡Registro exitoso! Ya puedes iniciar sesión');
        this.registerLoading = false;
        this.isLogin = true;
        this.fullName = ''; this.email = ''; this.password = '';
      },
      error: (err) => {
        this.registerLoading = false;
        this.registerError = err.message;
        this.showToast('error', err.message);
      }
    });
  }

  //Lógica de Recuperación de Contraseña 
  openForgotPassword() {
    this.resetRecoveryForm();
    this.showForgotDialog = true;
  }

  resetRecoveryForm() {
    this.recoveryStep = 'email';
    this.forgotEmail = '';
    this.securityQuestion = '';
    this.securityAnswer = '';
    this.resetCode = '';
    this.newPassword = '';
    this.confirmPassword = '';
    this.codeSent = false;
    this.userFound = false;
  }

  checkEmailAndContinue() {
    if (!this.forgotEmail) {
      this.showToast('error', 'Ingresa tu correo electrónico');
      return;
    }
    this.authService.getUserByEmailOrId(this.forgotEmail).subscribe({
      next: (user) => {
        this.userFound = true;
        this.securityQuestion = user.question || '¿Cuál es el nombre de tu primera mascota?';
        this.recoveryStep = 'method';
      },
      error: () => this.showToast('error', 'No encontramos un usuario con ese correo')
    });
  }

  sendResetCode() {
    this.authService.forgotPassword(this.forgotEmail).subscribe({
      next: () => {
        this.codeSent = true;
        this.recoveryStep = 'code';
        this.showToast('success', 'Código enviado a tu correo');
      },
      error: () => this.showToast('error', 'Error al enviar el código')
    });
  }

  resetPasswordByCode() {
    if (this.validateNewPassword()) {
      this.authService.resetPassword({
        email: this.forgotEmail,
        code: this.resetCode,
        newPassword: this.newPassword
      }).subscribe({
        next: () => this.handleResetSuccess(),
        error: (err) => this.showToast('error', err?.error?.message || 'Error al restablecer')
      });
    }
  }

  resetPasswordByAnswer() {
    if (this.validateNewPassword()) {
      this.authService.resetPassword({
        email: this.forgotEmail,
        answer: this.securityAnswer,
        newPassword: this.newPassword
      }).subscribe({
        next: () => this.handleResetSuccess(),
        error: (err) => this.showToast('error', err?.error?.message || 'Respuesta incorrecta')
      });
    }
  }

  private validateNewPassword(): boolean {
    if (this.newPassword !== this.confirmPassword) {
      this.showToast('warn', 'Las contraseñas no coinciden');
      return false;
    }
    if (this.newPassword.length < 6) {
      this.showToast('warn', 'Mínimo 6 caracteres');
      return false;
    }
    return true;
  }

  private handleResetSuccess() {
    this.showToast('success', '¡Contraseña actualizada!');
    this.recoveryStep = 'success';
    setTimeout(() => {
      this.showForgotDialog = false;
      this.isLogin = true;
    }, 2000);
  }

  // --- Google & Utils ---
  private loadGoogleScript() {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.onload = () => this.initGoogle();
    document.body.appendChild(script);
  }

  private initGoogle(): void {
  google.accounts.id.initialize({
    client_id: environment.GOOGLE_CLIENT_ID,
    callback: (response: any) => {
      // 1. Enviamos el token de Google al backend
      this.authService.googleLogin(response.credential).subscribe({
        next: (res: any) => {
          // Usamos la misma lógica que tu login manual
          if (res.success === true) {
            // Sacamos el token (si el backend genera uno) o usamos el de Google como respaldo
            const token = res.data?.access_token || res.access_token || response.credential;
            
            if (token) {
              localStorage.setItem('auth_token', token);
              
              // Guardamos el objeto user que viene en res.data.user
              if (res.data?.user) {
                localStorage.setItem('current_user', JSON.stringify(res.data.user));
              }

              this.showToast('success', `¡Bienvenido ${res.data?.user?.fullName || ''}!`);
              this.router.navigate(['/user']);
            }
          } else {
            this.showToast('error', res.message || 'Error en autenticación Google');
          }
        },
        error: (err) => {
          console.error('GOOGLE ERROR', err);
          this.showToast('error', err.error?.message || 'Error al conectar con Google');
        },
      });
    },
  });

  google.accounts.id.renderButton(
    document.getElementById('googleBtn'),
    { theme: 'outline', size: 'large', width: 300 }
  );
}

  private showToast(severity: any, detail: string) {
    this.messageService.add({ severity, detail, life: 3000 });
  }
}