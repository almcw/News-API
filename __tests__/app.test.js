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
  test("returns status 200", () => {
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

describe.only("PATCH /api/articles/:article_id", () => {
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
