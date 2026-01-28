import Booking from './models/Booking'

export const startCron = () => {
    console.log('Starting expiry cron job...')

    // Check every minute
    setInterval(async () => {
        try {
            const now = new Date()
            const expiryTime = new Date(now.getTime() - 15 * 60000) // 15 mins ago

            const result = await Booking.updateMany(
                {
                    status: 'pending_payment',
                    createdAt: { $lt: expiryTime }
                },
                { status: 'expired' }
            )

            if (result.modifiedCount > 0) {
                console.log(`Expired ${result.modifiedCount} bookings.`)
            }
        } catch (e) {
            console.error('Cron job error:', e)
        }
    }, 60000)
}
