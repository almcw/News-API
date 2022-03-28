const express = require("express");
const { getTopics } = require("./controllers/news");

const app = express();
app.use(express.json());

app.get("/api/topics", getTopics);

app.use((req, res, next) => {
  res.status(404).send({ msg: "path not found" });
});

module.exports = app;
