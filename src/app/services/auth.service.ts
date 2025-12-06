import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { DTOUser } from '../models/dto-user';
import { DTOToken } from '../models/dto-token';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  
  // 1. Definimos la ruta de la API de autenticación
  private ruta_servidor: string = "http://localhost:8080/api/auth";
  
  // 2. BehaviorSubject para saber si el usuario está logueado
  // (Esto es más avanzado que el ejemplo de tu profe, pero es la forma correcta)
  private loggedIn = new BehaviorSubject<boolean>(this.hasToken());
  
  constructor(private http: HttpClient) { }

  // --- Métodos de API (Login/Registro) ---

  /**
   * Llama al endpoint /login y guarda el token si es exitoso.
   */
  login(user: { username: string, password: string }): Observable<DTOToken> {
    return this.http.post<DTOToken>(`${this.ruta_servidor}/login`, user).pipe(
      tap((token: DTOToken) => {
        this.saveToken(token);
        this.loggedIn.next(true); // Emite que el usuario ya se logueó
      })
    );
  }

  /**
   * Llama al endpoint /register
   */
  register(user: DTOUser): Observable<DTOUser> {
    return this.http.post<DTOUser>(`${this.ruta_servidor}/register`, user);
  }

  /**
   * Cierra la sesión: borra el token y notifica a la app.
   */
  logout(): void {
    localStorage.removeItem('neurokid-token');
    this.loggedIn.next(false); // Emite que el usuario cerró sesión
  }

  // --- Métodos de Ayuda (Helpers) ---

  /**
   * Guarda el DTOToken completo en localStorage
   */
  private saveToken(token: DTOToken): void {
    localStorage.setItem('neurokid-token', JSON.stringify(token));
  }

  /**
   * Verifica si hay un token guardado
   */
  private hasToken(): boolean {
    return !!localStorage.getItem('neurokid-token');
  }

  /**
   * Devuelve el DTOToken guardado (si existe)
   */
  private getTokenData(): DTOToken | null {
    const token = localStorage.getItem('neurokid-token');
    return token ? JSON.parse(token) : null;
  }

  // --- Métodos Públicos para Guards y Componentes ---

  /**
   * Observable para que los componentes sepan si el usuario está logueado
   */
  get isUserLoggedIn(): Observable<boolean> {
    return this.loggedIn.asObservable();
  }

  /**
   * Obtiene solo el string del JWT para el Interceptor
   */
  getJwtToken(): string | null {
    return this.getTokenData()?.jwtToken || null;
  }

  /**
   * Obtiene los roles del usuario (ej: "ROLE_ADMIN;ROLE_PADRE")
   */
  getRoles(): string[] {
    const roles = this.getTokenData()?.authorities || '';
    return roles.split(';');
  }
  
  /**
   * Verifica si el usuario tiene un rol específico
   */
  hasRole(role: string): boolean {
    return this.getRoles().includes(role);
  }
  
  /**
   * Obtiene el ID del usuario logueado (ej: 1, 2, 3)
   */
  getUserId(): number | null {
    return this.getTokenData()?.id || null;
  }
}