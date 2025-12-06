import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private authService: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    
    // 1. Obtenemos el token del AuthService
    const token = this.authService.getJwtToken();

    // 2. Si el token existe, clonamos la petición y le añadimos la cabecera
    if (token) {
      const cloned = req.clone({
        headers: req.headers.set('Authorization', `Bearer ${token}`)
      });
      
      // 3. Enviamos la petición clonada
      return next.handle(cloned);
    }

    // 4. Si no hay token (ej: en el login), la petición sigue sin modificarse
    return next.handle(req);
  }
}