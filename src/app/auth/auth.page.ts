import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController, LoadingController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { AuthResponseData, AuthService } from './auth.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.page.html',
  styleUrls: ['./auth.page.scss'],
})
export class AuthPage implements OnInit {
  isLoading: boolean = false;
  isLogin: boolean = true;

  constructor(private authService: AuthService,
    private router: Router,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController) { }

  ngOnInit() {
  }

  private showAlert(message: string) {
    this.alertCtrl.create({
      header: 'Autenticação falhou',
      message: message,
      buttons: ['Ok']
    }).then(alertEl => alertEl.present());
  }

  authenticate(email, password) {
    this.isLoading = true;
    this.loadingCtrl.create({
      keyboardClose: true,
      message: 'Logging in...'
    }).then(loadingEl => {
      loadingEl.present();
      let authObs: Observable<AuthResponseData>;
      if (this.isLogin) {
        authObs = this.authService.login(email, password);
      } else {
        authObs = this.authService.signup(email, password);
      }
      authObs.subscribe(() => {
        this.isLoading = false;
        loadingEl.dismiss();
        this.router.navigateByUrl('/places/discover');
      }, errRes => {
        loadingEl.dismiss();
        const code = errRes.error.error.message;
        let message = 'Não foi possivel cadastrar';
        if (code == 'EMAIL_EXISTS') {
          message = 'Email já cadastrado';
        } else if (code === 'EMAIL_NOT_FOUND') {
          message = 'Email não encontrado';
        } else if (code === 'INVALID_PASSWORD') {
          message = 'Senha inválida';
        }
        this.showAlert(message);
      });
    });
  }

  onSubmit(form: NgForm) {
    if (!form.valid) {
      return;
    }
    const email = form.value.email;
    const password = form.value.password;
    this.authenticate(email, password);
    form.reset();
  }

  onSwitchAuthMode() {
    this.isLogin = !this.isLogin;
  }
}
