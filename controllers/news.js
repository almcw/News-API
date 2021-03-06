const {
  selectTopics,
  selectArticleById,
  selectUsers,
  updateArticleVotes,
  selectCommentsByArticleId,
  selectArticles,
  postComment,
  deleteCommentInDb,
} = require("../models/news");

exports.getTopics = (req, res) => {
  selectTopics().then((topics) => {
    res.status(200).send({ topics });
  });
};

exports.getArticle = (req, res, next) => {
  const articleId = req.params.article_id;
  selectArticleById(articleId)
    .then((article) => res.status(200).send({ article }))
    .catch(next);
};

exports.getArticleComments = (req, res, next) => {
  const articleId = req.params.article_id;
  const promises = [
    selectCommentsByArticleId(articleId),
    selectArticleById(articleId),
  ];
  Promise.all(promises)
    .then((results) => {
      const comments = results[0];
      res.send({ comments });
    })
    .catch(next);
};

exports.getArticles = (req, res, next) => {
  const { sort_by, order, topic } = req.query;
  selectArticles(sort_by, order, topic)
    .then((articles) => {
      res.status(200).send({ articles });
    })
    .catch(next);
};

exports.patchArticleVotes = (req, res, next) => {
  const { article_id } = req.params;
  const { inc_votes } = req.body;
  updateArticleVotes(article_id, inc_votes)
    .then((article) => res.status(200).send({ article }))
    .catch(next);
};

exports.getUsers = (req, res, next) => {
  selectUsers().then((users) => {
    res.status(200).send({ users });
  });
};

exports.postComment = (req, res, next) => {
  const { article_id } = req.params;
  const { username, body } = req.body;
  selectArticleById(article_id)
    .then((result) => postComment(article_id, username, body))
    .then((results) => {
      res.status(201).send({ comment: results });
    })
    .catch(next);
};

exports.deleteCommentById = (req, res, next) => {
  const { comment_id } = req.params;
  deleteCommentInDb(comment_id)
    .then(() => res.status(204).send({}))
    .catch(next);
};
