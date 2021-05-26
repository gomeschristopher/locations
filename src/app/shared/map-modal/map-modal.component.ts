import { AfterViewInit, Component, ElementRef, Input, OnDestroy, OnInit, Renderer2, ViewChild } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-map-modal',
  templateUrl: './map-modal.component.html',
  styleUrls: ['./map-modal.component.scss'],
})
export class MapModalComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('map') mapElementRef: ElementRef;
  @Input() center = {
    lat: -34.397,
    lng: 150.644
  };
  @Input() selectable = true;
  @Input() closeButtonText = 'Cancelar';
  @Input() title = 'Selecione a localização';
  clickListener: any;
  googleMaps: any;

  constructor(
    private modalCtrl: ModalController,
    private render: Renderer2
  ) { }

  ngOnDestroy() {
    if(this.clickListener) this.googleMaps.event.removeListener(this.clickListener);
  }

  ngAfterViewInit() {
    this.getGoogleMaps().then(googleMaps => {
      this.googleMaps = googleMaps;
      const mapEl = this.mapElementRef.nativeElement;
      const map = new googleMaps.Map(mapEl, {
        center: this.center,
        zoom: 16
      });
      this.googleMaps.event.addListenerOnce(map, 'idle', () => {
        this.render.addClass(mapEl, 'visible');
      });
      if (this.selectable) {
        this.clickListener = map.addListener('click', event => {
          const selectedCoords = {
            lat: event.latLng.lat(),
            lng: event.latLng.lng()
          };
          this.modalCtrl.dismiss(selectedCoords);
        });
      } else {
        const marker = new googleMaps.Marker({
          position: this.center,
          map: map,
          title: 'Selecione a localização'
        });
        marker.setMap(map);
      }
    }).catch(err => {
      console.log(err);
    });
  }

  ngOnInit() { }

  onCancel() {
    this.modalCtrl.dismiss();
  }

  private getGoogleMaps(): Promise<any> {
    const win = window as any;
    const googleModule = win.google;
    if (googleModule && googleModule.maps) return Promise.resolve(googleModule.maps);
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://maps.googleapis.com/maps/api/js?key=' + environment.googleMapsApiKey;
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
      script.onload = () => {
        const loadedGoogleModule = win.google;
        if (loadedGoogleModule && loadedGoogleModule.maps) {
          resolve(loadedGoogleModule.maps);
        } else {
          reject('Google Maps não pode ser carregado');
        }
      };
    });
  }
}
