import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ActionSheetController, AlertController, LoadingController, ModalController, NavController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { switchMap, take } from 'rxjs/operators';
import { AuthService } from 'src/app/auth/auth.service';
import { BookingService } from 'src/app/bookings/booking.service';
import { CreateBookingComponent } from 'src/app/bookings/create-booking/create-booking.component';
import { MapModalComponent } from 'src/app/shared/map-modal/map-modal.component';
import { Place } from '../../place.model';
import { PlacesService } from '../../places.service';

@Component({
  selector: 'app-place-detail',
  templateUrl: './place-detail.page.html',
  styleUrls: ['./place-detail.page.scss'],
})
export class PlaceDetailPage implements OnInit, OnDestroy {
  place: Place;
  isBoolable: boolean = false;
  isLoading: boolean;
  private placeSub: Subscription;

  constructor(private router: Router,
    private navCtrl: NavController,
    private modalCtrl: ModalController,
    private route: ActivatedRoute,
    private placesService: PlacesService,
    private actionSheetCtrl: ActionSheetController,
    private bookingService: BookingService,
    private loadingCtrl: LoadingController,
    private authService: AuthService,
    private alertCtrl: AlertController) { }

  ngOnInit() {
    this.route.paramMap.subscribe(paramMap => {
      if (!paramMap.has('placeId')) {
        this.navCtrl.navigateBack('/places/discover');
        return;
      }
      this.isLoading = true;
      let fetchedUserId: string;
      return this.authService.userId
        .pipe(
          take(1),
          switchMap(userId => {
            if (!userId) {
              throw new Error('Usuário não encontrado');
            }
            fetchedUserId = userId;
            return this.placesService
              .getPlace(paramMap.get('placeId'));
          })).subscribe(place => {
            this.place = place;
            this.isBoolable = place.userId !== fetchedUserId;
            this.isLoading = false;
          }, err => {
            this.alertCtrl.create({
              header: 'Houve um erro',
              message: 'Não foi possivel encontrar o local',
              buttons: [{
                text: 'OK',
                handler: () => {
                  this.router.navigate(['/places/discover']);
                }
              }]
            }).then(alertEl => {
              alertEl.present();
            })
          });
    });
  }

  ngOnDestroy() {
    if (this.placeSub) this.placeSub.unsubscribe();
  }

  onBookPlace() {
    //this.router.navigateByUrl('/places/discover');
    //this.navCtrl.navigateBack('/places/discover');
    this.actionSheetCtrl.create({
      header: 'Escolha',
      buttons: [
        {
          text: 'Data',
          handler: () => this.openBookingModal('select')
        }, {
          text: 'Aleatorio',
          handler: () => this.openBookingModal('random')
        }, {
          text: 'Cancelar',
          role: 'cancel'
        }
      ]
    }).then(actionSheetEl => {
      actionSheetEl.present();
    });
  }

  onShowFullMap() {
    this.modalCtrl
      .create({
        component: MapModalComponent,
        componentProps: {
          center: {
            lat: this.place.location.lat,
            lng: this.place.location.lng
          },
          selectable: false,
          closeButtonText: 'Fechar',
          title: this.place.location.address
        }
      })
      .then(modalEl => {
        modalEl.present();
      });
  }

  openBookingModal(mode: 'select' | 'random') {
    console.log(mode);
    this.modalCtrl.create({
      component: CreateBookingComponent,
      componentProps: {
        selectedPlace: this.place,
        selectedMode: mode
      }
    }).then(modalEl => {
      modalEl.present();
      return modalEl.onDidDismiss();
    }).then(resultData => {
      if (resultData.role === 'confirm') {
        this.loadingCtrl.create({
          message: 'Reservando'
        }).then(loadingEl => {
          loadingEl.present();
          const data = resultData.data.bookingData;
          this.bookingService.addBooking(this.place.id, this.place.title,
            this.place.imageUrl, data.firstName, data.lastName, data.guestNumber,
            data.startDate, data.endDate)
            .subscribe(() => {
              loadingEl.dismiss();
            });
        })
      }
    });
  }
}
