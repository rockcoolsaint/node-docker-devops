const express = require("express");
const mongoose = require("mongoose");
const { MONGO_USER, MONGO_PASSWORD, MONGO_IP, MONGO_PORT, REDIS_URL, REDIS_PORT, SESSION_SECRET } = require("./config/config");
const session = require("express-session");
const redis = require("redis");
const cors = require("cors");

let RedisStore = require("connect-redis")(session)
let redisClient = redis.createClient({
	legacyMode: true,
	socket: {
		host: REDIS_URL,
		port: REDIS_PORT
	}
});
redisClient.connect(() => console.log('connected to REDIS')).catch(console.error)

// (async () => {
// 	redisClient.on('error', err => console.log('Error ' + err))
// 	await redisClient.connect();
// })();
// (async () => {
// 	redisClient.on('connect', () => console.log('Connected to Redis') )
// })();

const postRouter = require("./routes/postRoutes");
const userRouter = require("./routes/userRoutes");

const app = express();

const MONGOURL = `mongodb://${MONGO_USER}:${MONGO_PASSWORD}@${MONGO_IP}:${MONGO_PORT}/?authSource=admin`;
// mongoose.connect(MONGOURL, {
// 	useNewUrlParser: true,
// 	useUnifiedTopology: true
// })
// .then(() => console.log("successfully connected to DB"))
// .catch((e) => console.log(e));

const connectWithRetry = () => {
	mongoose.connect(MONGOURL, {
		useNewUrlParser: true,
		useUnifiedTopology: true
	})
	.then(() => console.log("successfully connected to DB"))
	.catch((e) => {
		console.log(e)
		setTimeout(connectWithRetry, 5000);
	});
}

connectWithRetry();

app.enable("trust proxy");
app.use(cors({}))
app.use(session({
	store: new RedisStore({client: redisClient}),
	secret: SESSION_SECRET,
	resave: false,
	saveUninitialized: false,
	cookie: {
		secure: false,
		httpOnly: true,
		maxAge: 3600000
	}
}))

app.use(express.json());

app.get("/api/v1", (req, res) => {
	res.send("<h2>Hi there!</h2>");
	console.log("yeah it ran");
})

// localhost:300/api/v1/post
app.use("/api/v1/posts", postRouter);
app.use("/api/v1/users", userRouter);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log(`listening on port ${PORT}`))