const request = require("supertest");
const app = require("../app");
const db = require("../db/connection");
const seed = require("../db/seeds/seed");
const data = require("../db/data/test-data/index");

afterAll(() => {
  return db.end();
});

beforeEach(() => {
  return seed(data);
});

describe("GET /api/topics", () => {
  test("returns status 200 and array of objects", () => {
    return request(app)
      .get("/api/topics")
      .expect(200)
      .then(({ body }) => {
        const { topics } = body;
        expect(topics).toBeInstanceOf(Array);
        expect(topics).toHaveLength(3);
        topics.forEach((topic) => {
          expect(topic).toEqual(
            expect.objectContaining({
              slug: expect.any(String),
              description: expect.any(String),
            })
          );
        });
      });
  });

  test("returns 404 not found when passed invalid path", () => {
    return request(app)
      .get("/api/topical")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("path not found");
      });
  });
});

describe("GET /api/articles/:article_id", () => {
  test("returns status 200 with returned object", () => {
    return request(app)
      .get("/api/articles/1")
      .expect(200)
      .then(({ body }) => {
        expect(body.article).toEqual({
          article_id: 1,
          author: "butter_bridge",
          body: "I find this existence challenging",
          created_at: "2020-07-09T20:11:00.000Z",
          title: "Living in the shadow of a great man",
          topic: "mitch",
          votes: 100,
          comment_count: 11,
        });
      });
  });

  test("returns status 404 with non-existant article_id", () => {
    return request(app)
      .get("/api/articles/199")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("No article found for article_id: 199");
      });
  });

  test("returns status 400 with bad article_id", () => {
    return request(app)
      .get("/api/articles/baddy")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("bad request");
      });
  });
});

describe("PATCH /api/articles/:article_id", () => {
  test("returns status 200", () => {
    return request(app)
      .patch("/api/articles/1")
      .send({ inc_votes: 5 })
      .expect(200);
  });

  test("updates votes for a given article correctly", () => {
    return request(app)
      .patch("/api/articles/1")
      .send({ inc_votes: 4 })
      .expect(200)
      .then(({ body }) => {
        expect(body.article).toEqual({
          article_id: 1,
          author: "butter_bridge",
          body: "I find this existence challenging",
          created_at: "2020-07-09T20:11:00.000Z",
          title: "Living in the shadow of a great man",
          topic: "mitch",
          votes: 104,
        });
      });
  });

  test("updates NEGATIVE votes for a given article correctly", () => {
    return request(app)
      .patch("/api/articles/1")
      .send({ inc_votes: -3 })
      .expect(200)
      .then(({ body }) => {
        expect(body.article).toEqual({
          article_id: 1,
          author: "butter_bridge",
          body: "I find this existence challenging",
          created_at: "2020-07-09T20:11:00.000Z",
          title: "Living in the shadow of a great man",
          topic: "mitch",
          votes: 97,
        });
      });
  });

  test("should give bad request error when input object key is incorrect", () => {
    return request(app)
      .patch("/api/articles/1")
      .send({ incc_votes: 3 })
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("bad request");
      });
  });

  test("should give bad request error when input object value is incorrect", () => {
    return request(app)
      .patch("/api/articles/1")
      .send({ incc_votes: "three" })
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("bad request");
      });
  });

  test("returns status 404 with non-existant article_id", () => {
    return request(app)
      .patch("/api/articles/199")
      .send({ incc_votes: "three" })
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("No article found for article_id: 199");
      });
  });
});

describe("GET /api/users", () => {
  test("should return 200 and an array of objects", () => {
    return request(app)
      .get("/api/users")
      .expect(200)
      .then(({ body }) => {
        const { users } = body;
        expect(users).toBeInstanceOf(Array);
        expect(users).toHaveLength(4);
        users.forEach((user) => {
          expect(user).toEqual(
            expect.objectContaining({
              username: expect.any(String),
            })
          );
        });
      });
  });
});

describe.only("GET /api/articles", () => {
  test("returns 400 when topic is invalid", () => {
    return request(app)
      .get("/api/articles?topic=injection")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Invalid topic query");
      });
  });

  test("returns 400 when sort_by is invalid", () => {
    return request(app)
      .get("/api/articles?sort_by=top_news")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Invalid sort query");
      });
  });

  test("returns 400 when order is invalid", () => {
    return request(app)
      .get("/api/articles?order=upside_down")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Invalid order query");
      });
  });

  test("returns 200 and expected array of objects in descending order of created_at by default", () => {
    return request(app)
      .get("/api/articles?topic=mitch")
      .expect(200)
      .then(({ body }) => {
        const { articles } = body;
        expect(articles).toBeInstanceOf(Array);
        expect(articles).toBeSortedBy("created_at", { descending: true });
        expect(articles).toHaveLength(12);
        articles.forEach((articles) => {
          expect(articles).toEqual(
            expect.objectContaining({
              article_id: expect.any(Number),
              author: expect.any(String),
              created_at: expect.any(String),
              title: expect.any(String),
              topic: expect.any(String),
              votes: expect.any(Number),
              comment_count: expect.any(Number),
            })
          );
        });
      });
  });

  test("returns 200 and expected array of objects in ascending order of created_at with asc query param", () => {
    return request(app)
      .get("/api/articles?order=asc&topic=paper")
      .expect(200)
      .then(({ body }) => {
        const { articles } = body;
        expect(articles).toBeInstanceOf(Array);
        expect(articles).toBeSortedBy("created_at", { descending: false });
        expect(articles).toHaveLength(12);
        articles.forEach((articles) => {
          expect(articles).toEqual(
            expect.objectContaining({
              article_id: expect.any(Number),
              author: expect.any(String),
              created_at: expect.any(String),
              title: expect.any(String),
              topic: expect.any(String),
              votes: expect.any(Number),
              comment_count: expect.any(Number),
            })
          );
        });
      });
  });
});

describe("GET /api/articles/:article_id/comments", () => {
    test("should return status 200 and an array of comments for given article_id ", () => {
      return request(app)
        .get("/api/articles/1/comments")
        .expect(200)
        .then(({ body }) => {
          const { comments } = body;
          expect(comments).toBeInstanceOf(Array);
          expect(comments).toHaveLength(11);
          comments.forEach((comment) => {
            expect(comment).toEqual(
              expect.objectContaining({
                article_id: expect.any(Number),
                author: expect.any(String),
                body: expect.any(String),
                comment_id: expect.any(Number),
                created_at: expect.any(String),
                votes: expect.any(Number),
              })
            );
          });
        });
    });

    test("should return 400 Bad Request where article is non-integer", () => {
      return request(app)
        .get("/api/articles/baddy/comments")
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe("bad request");
        });
    });
    

    test("should return 404 Bad Request where article doesn't exist", () => {
      return request(app)
        .get("/api/articles/9999/comments")
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).toBe("No article found for article_id: 9999");
        });
    });
});



describe("POST /api/articles/:article_id/comments", () => {
    test("returns 201 and the new record created when passed valid object", () => {
      return request(app)
        .post("/api/articles/1/comments")
        .send({ username: "icellusedkars", body: "great work!" })
        .expect(201)
        .then(({ body }) => {
          expect(body.comment).toEqual({
            article_id: 1,
            author: "icellusedkars",
            body: "great work!",
            comment_id: 19,
            votes: 0,
            created_at: expect.any(String),
          });
        });
    });

    test("returns 400 error when passed user that doesn't exist", () => {
      return request(app)
        .post("/api/articles/1/comments")
        .send({ username: "almcw", body: "great work!" })
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).toBe("user not found");
        });
    });
    test("returns ERROR when passed article_id that doesn't exist", () => {
      return request(app)
        .post("/api/articles/999/comments")
        .send({ username: "icellusedkars", body: "great work!" })
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).toBe("No article found for article_id: 999");
        });
    });

    test("returns 400 error when passed author that doesn't exist", () => {
      return request(app)
        .post("/api/articles/1/comments")
        .send({ username: "almcw", body: "great work!" })
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).toBe("user not found");
        });
    });

    test("returns 400 error when passed incorrect object", () => {
      return request(app)
        .post("/api/articles/1/comments")
        .send({ username: "icellusedkars", bbody: "great work!" })
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe("bad request");
        });
    });
  });

  test("returns 400 error when passed invalid article_id", () => {
    return request(app)
      .post("/api/articles/shrell/comments")
      .send({ username: "icellusedkars", bbody: "great work!" })
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("bad request");
      });
  });
});
