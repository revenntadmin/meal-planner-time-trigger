async function fill_user_meal_plan(pool) {
    const pgClient = await pool.connect()

    const query = 'SELECT * FROM public.set_all_users_two_week_meal_plan();'
    const result = await pgClient.query(query, []);
    console.log(result.rows[0])

    pgClient.release(); // Close the database connection
}


module.exports = {
    fill_user_meal_plan: fill_user_meal_plan,
};