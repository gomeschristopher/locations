import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ActionSheetController, AlertController, ModalController } from '@ionic/angular';
import { of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { Coordinates, PlaceLocation } from 'src/app/places/location.model';
import { environment } from 'src/environments/environment';
import { MapModalComponent } from '../../map-modal/map-modal.component';
import { Plugins, Capacitor } from '@capacitor/core';

@Component({
  selector: 'app-location-picker',
  templateUrl: './location-picker.component.html',
  styleUrls: ['./location-picker.component.scss'],
})
export class LocationPickerComponent implements OnInit {
  @Output() locationPick = new EventEmitter<PlaceLocation>();
  @Input() showPreview = false;
  selectedLocationImage: string;
  isLoading: boolean;

  constructor(private modalCtrl: ModalController,
    private http: HttpClient,
    private actionSheetCtrl: ActionSheetController,
    private alertCtrl: AlertController) { }

  ngOnInit() { }

  onPickLoacation() {
    this.actionSheetCtrl.create({
      header: 'Escolha', buttons: [
        {
          text: 'Localização atual',
          handler: () => this.locateUser()
        },
        {
          text: 'Selecionar no mapa',
          handler: () => this.openMap()
        },
        {
          text: 'Cancelar',
          role: 'cancel'
        },
      ]
    }).then(actionSheetEl => {
      actionSheetEl.present();
    });
  }

  private locateUser() {
    if (!Capacitor.isPluginAvailable('Geolocation')) {
      this.showErrorAlert();
      return;
    }
    this.isLoading = true;
    Plugins.Geolocation.getCurrentPosition()
    .then(geoPosition => {
      const coordinates: Coordinates = {
        lat: geoPosition.coords.latitude,
        lng: geoPosition.coords.longitude
      };
      this.createPlace(coordinates.lat, coordinates.lng);
      this.isLoading = false;
    })
    .catch(() => {
      this.isLoading = false;
      this.showErrorAlert();
    });
  }

  private showErrorAlert() {
    this.alertCtrl.create({
      header: 'Localização não disponivel',
      message: 'Tente selecionar no mapa',
      buttons: ["Ok"]
    }).then(alertEl => alertEl.present());
  }

  private openMap() {
    this.modalCtrl.create({
      component: MapModalComponent
    }).then(modalEl => {
      modalEl.onDidDismiss().then(modalData => {
        if (!modalData.data) {
          return;
        }
        const coordinates: Coordinates = {
          lat: modalData.data.lat,
          lng: modalData.data.lng
        };
        this.createPlace(coordinates.lat, coordinates.lng);
      });
      modalEl.present();
    });
  }

  private createPlace(lat: number, lng: number) {
    const pickedLocation: PlaceLocation = {
      lat: lat,
      lng: lng,
      address: null,
      staticMapImageUrl: null
    };
    this.isLoading = true;
        this.getAddress(lat, lng)
          .pipe(switchMap(address => {
            pickedLocation.address = address;
            return of(this.getMapImage(pickedLocation.lat, pickedLocation.lng, 14));
          })).subscribe(staticMapImageUrl => {
            pickedLocation.staticMapImageUrl = staticMapImageUrl;
            this.selectedLocationImage = staticMapImageUrl;
            this.isLoading = false;
            this.locationPick.emit(pickedLocation);
          });
  }

  private getAddress(lat: number, lng: number) {
    return this.http.get<any>(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${environment.googleMapsApiKey}`)
      .pipe(map(geoData => {
        if (!geoData || !geoData.results || geoData.results.lenght === 0) {
          return null;
        }
        return geoData.results[0].formatted_address;
      }));
  }

  private getMapImage(lat: number, lng: number, zoom: number) {
    return `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=${zoom}&size=500x300&maptype=roadmap
    &markers=color:red%7Clabel:Place%7C${lat},${lng}
    &key=${environment.googleMapsApiKey}`;
  }
}
