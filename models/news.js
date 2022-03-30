const db = require("../db/connection");

exports.selectTopics = () => {
  return db.query("SELECT * from topics;").then((result) => result.rows);
};

exports.selectArticleById = (article_id) => {
  return db
    .query(
      "select users.username AS author, title, article_id, body, topic, created_at, votes from articles INNER JOIN users ON articles.author = users.username where article_id = $1;",
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
      "select article_id, comment_id, votes, created_at, users.name AS author, body from comments INNER JOIN users ON comments.author = users.username where article_id = $1;",
      [article_id]
    )
    .then((result) => {
      const comments = result.rows;
      console.log(comments);
      // if (!result.rows[0]) {
      //   return Promise.reject({
      //     status: 200,
      //     msg: `No comments found for article_id: ${article_id}`,
      //   });
      // }
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
