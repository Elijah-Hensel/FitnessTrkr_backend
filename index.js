require("dotenv").config();

const { PORT = 3000 } = process.env;

const express = require("express");
const app = express();

const morgan = require("morgan");
const bodyParser = require("body-parser");
app.use(morgan("dev"));
app.use(bodyParser.json());

const cors = require("cors");
app.use(cors());

const { apiRouter } = require("./api");
app.use("/api", apiRouter);

const client = require("./db/client");

app.get("*", (_, res, __) => {
  res.status(404);
  res.send({ error: "route not found!" });
});

app.use((error, _, res, __) => {
  res.status(500);
  console.log(error, "500 status error");
  res.send({ error: error });
});

app.listen(PORT, () => {
  console.log("I am listening...");
});
client.connect();
