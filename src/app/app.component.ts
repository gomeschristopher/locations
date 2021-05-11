import { Component } from '@angular/core';
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  public appPages = [
    { title: 'Hoteis', url: '/places/discover', icon: 'business' },
    { title: 'Reservas', url: '/bookings', icon: 'checkbox' },
    { title: 'Sair', url: '/auth', icon: 'exit' },
    /*
      { title: 'Archived', url: '/folder/Archived', icon: 'archive' },
      { title: 'Trash', url: '/folder/Trash', icon: 'trash' },
      */
  ];
  constructor() { }
}
