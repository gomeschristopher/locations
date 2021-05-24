import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth/auth.service';
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  public appPages = [
    { title: 'Hoteis', url: '/places/discover', icon: 'business' },
    { title: 'Reservas', url: '/bookings', icon: 'checkbox' }
  ];
  constructor(private authService: AuthService,
    private router: Router) { }

  onLogout() {
    this.authService.logout();
    this.router.navigateByUrl('/auth');
  }
}
