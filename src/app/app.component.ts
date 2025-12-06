import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  standalone: false, // <-- AÑADE ESTA LÍNEA TAMBIÉN
  templateUrl: './app.component.html',
  styleUrls: ['./app.css']
})
export class AppComponent {
  title = 'neurokid-frontend';
}
