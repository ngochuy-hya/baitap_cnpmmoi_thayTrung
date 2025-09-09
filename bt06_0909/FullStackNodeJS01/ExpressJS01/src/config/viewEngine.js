const path = require('path');

const configViewEngine = (app) => {
    // Cấu hình view engine EJS
    app.set('view engine', 'ejs');
    app.set('views', path.join(__dirname, '../views'));
    
    // Cấu hình static files
    app.use('/static', require('express').static(path.join(__dirname, '../../public')));
    app.use('/uploads', require('express').static(path.join(__dirname, '../../uploads')));
};

module.exports = configViewEngine;
