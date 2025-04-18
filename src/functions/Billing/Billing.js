const { default: axios } = require("axios");
require('dotenv').config();
const app_server_url = process.env.NODE_ENV == 'production' ? process.env.APP_SERVER_URL_PRODUCTION : process.env.APP_SERVER_URL_DEVELOPMENT;

async function users_subscription_active_status(pool) {
    const pgClient = await pool.connect()

    try {
        // get all active plans
        const query = `SELECT *
                        FROM user_billing
                        WHERE active_plan = TRUE`
        const result = await pgClient.query(query, []);
        const all_active_billings = result.rows

        for (let i = 0; i < all_active_billings.length; i++) {
            const billing = all_active_billings[i]

            // get subscription from stripe
            const sub_result = await axios.get(app_server_url + '/api/billing/get-subscription?id=' + billing.stripe_subscription_id)
            const subscription = sub_result.data
            // If subscription is cancled and period has ended
            if (!subscription || (subscription.status != 'active' && (subscription.current_period_end * 1000) <= new Date().getTime())) {
                // Update active status to FALSE
                await axios.get(app_server_url + '/api/billing/update-user-subscription-status?user_id=' + billing.user_id + '&sub_id=' + billing.stripe_subscription_id)
            }
        }
    } catch (error) {
        console.log(error)
    }

    pgClient.release(); // Close the database connection
}


module.exports = {
    users_subscription_active_status: users_subscription_active_status,
};