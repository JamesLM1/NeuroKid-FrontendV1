import { Component } from '@angular/core';

@Component({
  selector: 'app-public-header',
  templateUrl: './public-header.component.html',
  standalone: false,
  styleUrls: ['./public-header.component.css']
})
export class PublicHeaderComponent {
  
  // Lógica para el menú móvil (como en tu app.js)
  isMobileMenuOpen = false;

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenu() {
    if (this.isMobileMenuOpen) {
      this.isMobileMenuOpen = false;
    }
  }
}