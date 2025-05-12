module.exports = app => {
    app.use("/api/login", require('./login'));
    app.use("/api/signup", require('./signup'));
    app.use("/api/contactus", require('./contactus'));
    app.use("/api/userfeedback", require('./userfeedback'));
    app.use("/api/recipe", require('./recipe'));
    app.use("/api/appointments", require('./appointment'));
    app.use("/api/imageClassification", require('./imageClassification'));
    app.use("/api/userprofile", require('./userprofile'));
    app.use("/api/userpassword", require('./userpassword'));
    app.use("/api/fooddata", require('./fooddata'));
    app.use("/api/user/preferences", require('./userPreferences'));
    app.use("/api/mealplan", require('./mealplan'));
};