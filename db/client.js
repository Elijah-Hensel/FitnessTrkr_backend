// build and export your unconnected client here

const { Client } = require("pg");
const CONNECTION_STRING = process.env.DATABASE_URL;
const client = new Client(
  CONNECTION_STRING || "https://localhost:5432/fitness-dev"
);

module.exports = client;
