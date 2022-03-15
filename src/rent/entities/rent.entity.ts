export class Rent {
    constructor(
        private readonly carId: number,
        private readonly startDate: Date,
        private readonly endDate: Date,
        private readonly cost: number
    ) { }
}