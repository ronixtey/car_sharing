export const RentOptions = {
    max_cars: 5,
    max_rent_days: 30,
    rent_interval: 3,
    cost: 1000,
    rates: [
        {
            from: 1,
            to: 4,
            discount: 0,
        },
        {
            from: 5,
            to: 9,
            discount: 5,
        },
        {
            from: 10,
            to: 17,
            discount: 10,
        },
        {
            from: 18,
            to: 29,
            discount: 15,
        }
    ]
} 