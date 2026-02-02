"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startCron = void 0;
const Booking_1 = __importDefault(require("./models/Booking"));
const startCron = () => {
    console.log('Starting expiry cron job...');
    // Check every minute
    setInterval(async () => {
        try {
            const now = new Date();
            const expiryTime = new Date(now.getTime() - 15 * 60000); // 15 mins ago
            const result = await Booking_1.default.updateMany({
                status: 'pending_payment',
                createdAt: { $lt: expiryTime }
            }, { status: 'expired' });
            if (result.modifiedCount > 0) {
                console.log(`Expired ${result.modifiedCount} bookings.`);
            }
        }
        catch (e) {
            console.error('Cron job error:', e);
        }
    }, 60000);
};
exports.startCron = startCron;
