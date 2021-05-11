import { Injectable } from '@angular/core';
import { Place } from './place.model';

@Injectable({
  providedIn: 'root'
})
export class PlacesService {
  private _places: Place[] = [
    new Place('p1', 'Manthattan Mansion', 'No coração de NY',
    'https://i.pinimg.com/originals/d4/7d/73/d47d733da5552601eb5dbcfab047015a.jpg',
    149.99),
    new Place('p2', 'Romantic Paris', 'PARIS hotel',
    'https://media-cdn.tripadvisor.com/media/photo-s/15/a1/d2/af/hotel-r-de-paris.jpg',
    200.99),
    new Place('p3', 'Copacabana palace', 'Muitas prais',
    'https://cf.bstatic.com/images/hotel/max1280x900/175/175154423.jpg',
    180.99),
  ];

  get places() {
    return [...this._places];
  }

  constructor() { }

  getPlace(id: string) {
    return {...this._places.find(p => p.id === id)};
  }
}
