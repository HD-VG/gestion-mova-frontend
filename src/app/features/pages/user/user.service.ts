import { Injectable, inject,} from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Observable, map } from 'rxjs';

export interface User {
  id: string;
  role: string;
  fullName: string;
  email: string;
  document?: string;
  phone?: string;
  address?: string;
  question?: string;
  answer?: string;
  commissionPct?: number;
  vehicleType?: string;
  licensePlate?: string;
  pointsBalance: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  // ... otros campos que no editamos
}

export interface UpdateUserDto {
  fullName?: string;
  email?: string;
  phone?: string;
  address?: string;
  document?: string;
  commissionPct?: number;
  vehicleType?: string;
  licensePlate?: string;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);
  private api = environment.apiUrl;

  private getHeaders(): HttpHeaders {
  const token = localStorage.getItem('auth_token');
  return new HttpHeaders({
    Authorization: token ? `Bearer ${token}` : ''
  });
}

  getUserById(id: string): Observable<User> {
    return this.http.get<any>(`${this.api}/users/${id}`, { headers: this.getHeaders() })
      .pipe(map(res => res.data || res)); // extrae data si existe
  }

  updateUser(id: string, dto: UpdateUserDto): Observable<User> {
    return this.http.put<any>(`${this.api}/users/${id}`, dto, { headers: this.getHeaders() })
      .pipe(map(res => res.data || res));
  }

  changePassword(id: string, dto: ChangePasswordDto): Observable<any> {
    return this.http.put<any>(`${this.api}/users/${id}/change-password`, dto, { headers: this.getHeaders() });
  }
}