const express = require("express");
const bunyan = require("bunyan");
const Redis = require("ioredis");
const bodyParser = require("body-parser");
// const { redis: redisConfig } = require("config");
const getRoot = require("./get-root");

const redis = new Redis({
  port: process.env.REDIS_PORT, // Redis port
  host: process.env.REDIS_HOST, // Redis host
});
const app = express();
const port = 3000;

app.disable("x-powered-by");

app.use(bodyParser.json());

app.use((req, res, next) => {
  req.log = bunyan.createLogger({
    name: "tts-with-cache-logger",
    stream: process.stdout,
    level: "info",
  });
  req.redis = redis;

  next();
});

app.get("/", getRoot);

app.listen(port, () => {
  console.log(`tts-with-cache listening at http://localhost:${port}`);
});
