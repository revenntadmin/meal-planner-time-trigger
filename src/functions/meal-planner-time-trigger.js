const { app } = require('@azure/functions');
const pg = require('pg');
const fs = require('fs');
const MealPlanner = require('./MealPlan/MealPlan');
const Billing = require('./Billing/Billing');

// 12-11-2024
// Create a pg pool
const pool = new pg.Pool({
    host: "meal-planner-db.postgres.database.azure.com",
    user: "MealPlannerAPI",
    password: "Sonbol@17",
    database: "meal_planner",
    port: 5432,
    ssl: {
        ca: fs.readFileSync('./certificate.pem')
    }
});

app.timer('meal-planner-time-trigger', {
    schedule: '0 */8 * * * *',
    handler: (myTimer, context) => {

        // Set user's subscription active status
        Billing.users_subscription_active_status(pool)

        // Fill 2 week meal plan of all users
        MealPlanner.fill_user_meal_plan(pool)
    }
});
