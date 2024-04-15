const express = require('express');
const app = express();
const path = require("path");
const router = express.Router();
const dbPath = path.resolve(__dirname,'model', 'db', 'database.sqlite');
const db = require('better-sqlite3')(dbPath);
const {engine} = require('express-handlebars');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');

console.log('Connected to the database '+dbPath.split('\\').pop());
app.use(express.static(path.join(__dirname + '/public') ) );

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const port = process.env.PORT || 8080;
//Handlebars
app.engine('handlebars', engine({defaultLayout: 'main', layoutsDir: 'views/layouts/'}));

app.set('views', __dirname + '/views');
app.set('view engine', 'handlebars');
//Routes
app.use(cookieParser());


app.use(session({
    name: 'sid',
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 2, // expires in 2 hours
        sameSite: true,
        secure: false, // set this to true in production
    }
}));

app.use((req, res, next) => {
    if (req.session.userId) {
        const userId = req.session.userId;
        const unreadCount = db.prepare('SELECT COUNT(*) as message FROM messages WHERE receiver_id = ? AND unread = 1').get(userId);
        res.locals.unreadCount = unreadCount.message;
    }
    next();
});

app.use(require('./routes/routeHome.js'));
app.use(require('./routes/routeRegister.js'));
app.use(require('./routes/routeUserPage.js'));
app.use(require('./routes/routeLogin.js'));
app.use(require('./routes/routeLogout.js'));
app.use(require('./routes/routeAppointments.js'));
app.use(require('./routes/routeMessages.js'));

app.listen(port, () => {
    console.log('Server is running on port 8080');
});


