const express = require("express");

const {
  getTopics,
  getArticle,
  getArticles,
  getUsers,
  patchArticleVotes,
  getArticleComments,
  postComment,
} = require("./controllers/news");

const app = express();
app.use(express.json());

app.get("/api/topics", getTopics);
app.get("/api/articles", getArticles);
app.get("/api/articles/:article_id", getArticle);
app.get("/api/users", getUsers);
app.get("/api/articles/:article_id/comments", getArticleComments);

app.patch("/api/articles/:article_id", patchArticleVotes);

app.post("/api/articles/:article_id/comments", postComment);

app.use((req, res, next) => {
  res.status(404).send({ msg: "path not found" });
});

app.use((err, req, res, next) => {
  const badReqCodes = ["22P02", "23502"];
  const invalidReqCodes = ["23503"];
  if (badReqCodes.includes(err.code)) {
    res.status(400).send({ msg: "bad request" });
  } else if (invalidReqCodes.includes(err.code)) {
    res.status(404).send({ msg: "user not found" });
  } else {
    next(err);
  }
});

app.use((err, req, res, next) => {
  if (err.status) {
    res.status(err.status).send({ msg: err.msg });
  } else next(err);
});

app.use((err, req, res, next) => {
  console.log(err);
  res.status(500).send("Server Error!");
});

module.exports = app;
