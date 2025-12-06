import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  standalone: false,
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  constructor(private router: Router) { }

  ngOnInit(): void {
    // Lógica para el scrollspy (si es necesario)
  }

  // Función para manejar los links de registro/login
  navigate(path: string): void {
    this.router.navigate([path]);
  }
}