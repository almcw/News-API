const {
  selectTopics,
  selectArticleById,
  updateArticleVotes,
  selectUsers,
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
