import { Component, OnInit, inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { UserService, User, UpdateUserDto, ChangePasswordDto } from './user.service';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../auth/auth.service';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { DialogModule } from 'primeng/dialog';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    PasswordModule,
    DialogModule,
    ToastModule
  ],
  templateUrl: './user.component.html',
  styleUrl: './user.component.scss',
  providers: [MessageService]
})
export class UserComponent implements OnInit {
  private userService = inject(UserService);
  private router = inject(Router);
  private messageService = inject(MessageService);
  private platformId = inject(PLATFORM_ID);
  private cdr = inject(ChangeDetectorRef);
  private authService = inject(AuthService);

  user: User | null = null;
  isEditing = false;
  loading = true;

   // --- Recuperación ---
   isLogin = true;
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

  // Formulario editable
  form: UpdateUserDto = {};

  // Cambio de contraseña
  showChangePasswordDialog = false;
  currentPassword = '';
  confirmNewPassword = '';

  ngOnInit() {
    this.loadUser();
  }

  loadUser() {
    if (!isPlatformBrowser(this.platformId)) {
      console.warn('SSR: saltando localStorage');
      this.loading = false;
      this.cdr.detectChanges();
      return;
    }

    const storedUser = localStorage.getItem('current_user');

    let userId = '';
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        userId = parsed.id;
      } catch (e) {
        console.error('Error parseando current_user:', e);
      }
    }

    if (!userId) {
      this.showToast('error', 'No se encontró ID de usuario');
      this.router.navigate(['/auth']);
      this.loading = false;
      this.cdr.detectChanges();
      return;
    }

    this.userService.getUserById(userId).subscribe({
      next: (response) => {
        const userData = response;

        if (userData && userData.id) {
          this.user = userData;
          this.form = { ...userData };
        } else {
          console.warn('Respuesta sin usuario válido:', response);
          this.showToast('warn', 'No se encontraron datos del usuario');
        }

        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar usuario:', err);
        let msg = 'Error al cargar el perfil';

        if (err.status === 401) msg = 'Sesión expirada o no autorizado (401)';
        if (err.status === 404) msg = 'Usuario no encontrado (404)';
        if (err.status === 0) msg = 'No se pudo conectar al servidor';

        this.showToast('error', msg + (err.error?.message ? `: ${err.error.message}` : ''));
        this.loading = false;
        this.cdr.detectChanges();

        if (err.status === 401) this.logout();
      },
      complete: () => {
        this.cdr.detectChanges();
      }
    });
  }

  toggleEdit() {
    this.isEditing = !this.isEditing;
    if (!this.isEditing && this.user) {
      this.form = { ...this.user };
    }
    this.cdr.detectChanges();
  }

  saveChanges() {
  if (!this.user?.id) return;

  this.loading = true;

  const updateData = this.getUpdateDto();

  this.userService.updateUser(this.user.id, updateData).subscribe({
    next: (updatedUser) => {
      this.user = updatedUser;
      this.form = { ...updatedUser };
      this.isEditing = false;
      this.showToast('success', 'Perfil actualizado correctamente');
      this.loading = false;
      this.cdr.detectChanges();
    },
    error: (err) => {
      console.error('Error al guardar:', err);
      this.showToast('error', err.error?.message || 'Error al actualizar perfil');
      this.loading = false;
      this.cdr.detectChanges();
    }
  });
}

  openChangePassword() {
    this.showChangePasswordDialog = true;
    this.currentPassword = '';
    this.newPassword = '';
    this.confirmNewPassword = '';
    this.cdr.detectChanges();
  }

  changePassword() {
    if (this.newPassword !== this.confirmNewPassword) {
      this.showToast('warn', 'Las contraseñas nuevas no coinciden');
      return;
    }

    if (this.newPassword.length < 6) {
      this.showToast('warn', 'La nueva contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (!this.user?.id) return;

    const dto: ChangePasswordDto = {
      currentPassword: this.currentPassword,
      newPassword: this.newPassword
    };

    this.userService.changePassword(this.user.id, dto).subscribe({
      next: () => {
        this.showToast('success', 'Contraseña actualizada correctamente');
        this.showChangePasswordDialog = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.showToast('error', err.error?.message || 'Error al cambiar contraseña');
      }
    });
  }
  private getUpdateDto(): UpdateUserDto {
  if (!this.form) return {};

  return {
    fullName: this.form.fullName,
    email: this.form.email,
    phone: this.form.phone,
    address: this.form.address,
    document: this.form.document,
    commissionPct: this.form.commissionPct,
    vehicleType: this.form.vehicleType,
    licensePlate: this.form.licensePlate,
  };
}
  logout() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('current_user');
    this.router.navigate(['/login-register']);
    this.showToast('info', 'Sesión cerrada');
  }

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

  private showToast(severity: 'success' | 'error' | 'warn' | 'info', detail: string) {
    this.messageService.add({ severity, detail, life: 4000 });
  }
}