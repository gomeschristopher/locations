export class Booking {
    constructor(
        public id: string,
        public placeId,
        public userId: string,
        public placeTitle: string,
        public placeImage: string,
        public firstName: string,
        public lastName: string,
        public guestNumber: number,
        public bookedFrom: Date,
        public bookedTo: Date
    ) { }
}