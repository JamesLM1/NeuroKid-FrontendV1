import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { map, take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    // 1. Obtenemos los roles esperados para esta ruta (ej: ['ROLE_ADMIN'])
    const expectedRoles = route.data['roles'] as string[];

    // 2. Usamos el Observable del AuthService
    return this.authService.isUserLoggedIn.pipe(
      take(1), // Tomamos solo el primer valor
      map(isLoggedIn => {
        
        // 3. Si no está logueado...
        if (!isLoggedIn) {
          // Lo mandamos al login
          return this.router.createUrlTree(['/login']);
        }

        // 4. Si está logueado, verificamos el rol
        if (expectedRoles && expectedRoles.length > 0) {
          const userRoles = this.authService.getRoles();
          
          // Verificamos si AL MENOS UNO de los roles esperados está en los roles del usuario
          const hasRole = expectedRoles.some(role => userRoles.includes(role));
          
          if (hasRole) {
            return true; // Tiene el rol, puede pasar
          } else {
            // No tiene el rol, lo mandamos al login (o a una página de "acceso denegado")
            return this.router.createUrlTree(['/login']);
          }
        }
        
        // 5. Si está logueado y la ruta no requiere rol (ej: un /perfil genérico)
        return true; 
      })
    );
  }
}