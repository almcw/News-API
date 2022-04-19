const db = require("../db/connection");

exports.selectTopics = () => {
  return db.query("SELECT * from topics;").then((result) => result.rows);
};

exports.selectArticleById = (article_id) => {
  return db

    .query(
      "select users.username AS author, title, articles.article_id, articles.body, topic, articles.created_at, articles.votes, count(comment_id)::INT AS comment_count FROM articles INNER JOIN users ON articles.author = users.username LEFT JOIN comments ON articles.article_id = comments.article_id where comments.article_id = $1 GROUP BY articles.article_id, users.username ;",
      [article_id]
    )
    .then((result) => {
      const article = result.rows[0];
      if (!article) {
        return Promise.reject({
          status: 404,
          msg: `No article found for article_id: ${article_id}`,
        });
      }
      return article;
    });
};

exports.selectCommentsByArticleId = (article_id) => {
  return db
    .query(
      "SELECT article_id, comment_id, votes, created_at, author, body FROM comments WHERE article_id = $1;",
      [article_id]
    )
    .then((result) => {
      const comments = result.rows;
      return comments;
    });
};

exports.updateArticleVotes = (article_id, newVote) => {
  return db
    .query(
      `UPDATE articles SET votes = votes + $2 WHERE article_id = $1 RETURNING *;`,
      [article_id, newVote]
    )
    .then((result) => {
      const article = result.rows[0];
      if (!article) {
        return Promise.reject({
          status: 404,
          msg: `No article found for article_id: ${article_id}`,
        });
      }
      return article;
    });
};

exports.selectUsers = () => {
  return db.query("SELECT username from users;").then((result) => result.rows);
};

exports.selectArticles = (sort_by = "created_at", order = "desc", topic) => {
  if (
    ![
      "created_at",
      "allowed_column",
      "users",
      "author",
      "title",
      "article_id",
      "topic",
      "votes",
      "comment_count",
    ].includes(sort_by)
  ) {
    return Promise.reject({ status: 400, msg: "Invalid sort query" });
  }
  if (!["asc", "desc"].includes(order)) {
    return Promise.reject({ status: 400, msg: "Invalid order query" });
  }
  if (topic && !["mitch", "cats", "paper"].includes(topic)) {
    return Promise.reject({ status: 400, msg: "Invalid topic query" });
  }

  const queryValues = [];
  let queryStr = `SELECT users.username AS author, title, articles.article_id, topic, articles.created_at, articles.votes, count(comment_id)::INT AS comment_count FROM articles INNER JOIN users ON articles.author = users.username LEFT JOIN comments ON articles.article_id = comments.article_id `;

  if (topic) {
    queryValues.push(topic);
    queryStr += ` WHERE articles.topic = $1`;
  }

  queryStr += ` GROUP BY articles.article_id, users.username ORDER BY ${sort_by} ${order};`;
  // console.log(queryStr);
  // console.log(queryValues);
  return db.query(queryStr, queryValues).then((result) => {
    return result.rows;
  });
};

exports.postComment = (article_id, username, body) => {
  return db
    .query(
      "INSERT INTO comments (article_id, author, body) VALUES ($1, $2, $3) RETURNING *;",
      [article_id, username, body]
    )
    .then((result) => {
      return result.rows[0];
    });
};

exports.deleteCommentInDb = (comment_id) => {
  return db
    .query("DELETE FROM comments WHERE comment_id = $1;", [comment_id])
    .then((result) => {
      return result.rows[0];
    });
};
