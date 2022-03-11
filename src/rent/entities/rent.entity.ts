export class Rent {
    constructor(
        private readonly carId: number,
        private readonly startDate,
        private readonly endDate,
        private readonly cost: number
    ) { }
}