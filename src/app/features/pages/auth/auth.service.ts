import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Observable,throwError } from 'rxjs';
import { map,catchError } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private api = environment.apiUrl;

  // LOGIN
  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.api}/users/login`, { email, password });
  }

  googleLogin(idToken: string): Observable<any> {
    return this.http.post(`${this.api}/users/login/google`, { idToken });
  }

  // FORGOT PASSWORD - envía código al correo
  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.api}/users/forgot-password`, { email });
  }

  // Obtener datos del usuario
  getUserByEmailOrId(value: string): Observable<any> {
  return this.http.get(`${this.api}/users/${value}`).pipe(
    map((response: any) => response.data)
  );
}
  // RESET PASSWORD (acepta code O answer)
  resetPassword(data: {
    email: string;
    code?: string;
    answer?: string;
    newPassword: string;
  }): Observable<any> {
    return this.http.post(`${this.api}/users/reset-password`, data);
  }

   // Registro nuevo
   register(data: {
    role: string;
    fullName: string;
    email: string;
    password: string;
  }): Observable<any> {
    return this.http.post(`${this.api}/users/register`, data).pipe(
      map((response: any) => response.data || response), 
      catchError((error) => {
        return throwError(() => error);
      })
    );
  }
}