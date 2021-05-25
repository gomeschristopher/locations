import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { delay, map, switchMap, take, tap } from "rxjs/operators";
import { AuthService } from "../auth/auth.service";
import { Booking } from "./booking.model";

interface BookingData {
    bookedFrom: string;
    bookedTo: string;
    firstName: string;
    guestNumber: number;
    lastName: string;
    placeId: string;
    placeImage: string;
    placeTitle: string;
    userId: string;
}

@Injectable({ providedIn: 'root' })
export class BookingService {
    private _bookings = new BehaviorSubject<Booking[]>([]);

    get bookings() {
        return this._bookings.asObservable();
    }

    constructor(private authService: AuthService,
        private http: HttpClient) { }

    addBooking(placeId: string, placeTitle: string, placeImage: string, firstName: string,
        lastName: string, guestNumber: number, dateFrom: Date, dateTo: Date) {
        let generateId: string;
        const newBooking = new Booking(Math.random().toString(), placeId,
            this.authService.userId, placeTitle, placeImage, firstName, lastName,
            guestNumber, dateFrom, dateTo);
        return this.http.post<{ name: string }>('https://christopher-places-default-rtdb.firebaseio.com/bookings.json', {
            ...newBooking,
            id: null
        }).pipe(switchMap(resData => {
            generateId = resData.name;
            return this.bookings;
        }), take(1), tap(bookings => {
            newBooking.id = generateId;
            this._bookings.next(bookings.concat(newBooking));
        }));
    }

    cancelBooking(bookingId: string) {
        return this.http.delete(`https://christopher-places-default-rtdb.firebaseio.com/bookings/${bookingId}.json`)
        .pipe(switchMap(() => {
            return this.bookings;
        }),
        take(1),
        tap(bookings => {
            this._bookings.next(bookings.filter(b => b.id !== bookingId));
        }));
    }

    fetchBookings() {
        return this.http.get<{ [key: string]: BookingData }>(`https://christopher-places-default-rtdb.firebaseio.com/bookings.json?orderBy="userId"&equalTo="${this.authService.userId}"`)
            .pipe(map(bookingData => {
                const bookings = [];
                for (const key in bookingData) {
                    if (bookingData.hasOwnProperty(key)) {
                        bookings.push(new Booking(key, bookingData[key].placeId, bookingData[key].userId,
                            bookingData[key].placeTitle,
                            bookingData[key].placeImage,
                            bookingData[key].firstName,
                            bookingData[key].lastName,
                            bookingData[key].guestNumber,
                            new Date(bookingData[key].bookedFrom),
                            new Date(bookingData[key].bookedTo)));
                    }
                }
                return bookings;
            }), tap(bookings => {
                this._bookings.next(bookings);
            }));
    }
}