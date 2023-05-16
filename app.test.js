const request = require("supertest");
const app = require("./app");
const { db } = require("./database");

afterAll(db.$pool.end);

describe("GET /todos", () => {
  beforeEach(async () => {
    await db.none(`delete from todoitems`);
    await db.none(
      `insert into todoitems(id, value, completed) values('1', 'b: todo', false)`
    );
    await db.none(
      `insert into todoitems(id, value, completed) values('2', 'a: todo', false)`
    );
    await db.none(
      `insert into todoitems(id, value, completed, completed_time) values('3', 'c: todo', true, now())`
    );
    await db.none(
      `insert into todoitems(id, value, completed, completed_time) values('4', 'd: todo', true, now() + interval '1 day')`
    );
    await db.none(
      `insert into todoitems(id, value, completed, completed_time) values('5', 'e: todo', true, now() + interval '2 day')`
    );
  });
  afterEach(async () => {
    await db.none(`delete from todoitems`);
  });

  it("when completed param is not provided or false, should return incompleted", async () => {
    const response = await request(app).get("/todos");
    const data = response.body.data;
    expect(data.length).toBe(2);
    expect(data[0].id).toBe("2");
    expect(data[0].value).toBe("a: todo");

    const notCompleted = await request(app).get("/todos?completed=false");
    const nc_data = notCompleted.body.data;
    expect(nc_data.length).toBe(2);
    expect(nc_data[0].id).toBe("2");
    expect(nc_data[0].value).toBe("a: todo");
  });

  it("when completed param is true, should return results filtered by completed, ordered by completion time", async () => {
    const completed = await request(app).get("/todos?completed=true");
    const completedData = completed.body.data;
    expect(completedData.length).toBe(3);
    expect(completedData[0].id).toBe("5");
    expect(completedData[1].id).toBe("4");
    expect(completedData[2].id).toBe("3");
  });

  it("should return max 10 results when completed is true", async () => {
    await db.none(`delete from todoitems`);
    for (let i = 0; i < 15; i++) {
      await db.none(
        `insert into todoitems(id, value, completed, completed_time) values('${i}', 'todo', true, now())`
      );
    }
    const completed = await request(app).get("/todos?completed=true");
    const completedData = completed.body.data;
    expect(completedData.length).toBe(10);
  });

  it("when search term is provided, should filter based on search term", async () => {
    const response = await request(app).get("/todos?query=b");
    const data = response.body.data;
    expect(data.length).toBe(1);
    expect(data[0].id).toBe("1");
  });
});

describe("POST /todos", () => {
  beforeEach(async () => {
    await db.none(`delete from todoitems`);
  });
  afterEach(async () => {
    await db.none(`delete from todoitems`);
  });

  it("should insert ", async () => {
    const response = await request(app).post("/todos").send({ todo: "todo1" });
    expect(response.statusCode).toBe(201);
    const tableData = await db.any(`select * from todoitems`);
    expect(tableData.length).toBe(1);
    expect(tableData[0].value).toBe("todo1");
  });
});

describe("DELETE /todos", () => {
  beforeEach(async () => {
    await db.none(`delete from todoitems`);
    await db.none(
      `insert into todoitems(id, value, completed) values('1', 'b: todo', false)`
    );
    await db.none(
      `insert into todoitems(id, value, completed) values('2', 'a: todo', false)`
    );
  });
  afterEach(async () => {
    await db.none(`delete from todoitems`);
  });

  it("should delete all todos", async () => {
    const response = await request(app).delete("/todos");
    expect(response.statusCode).toBe(200);
    const tableData = await db.any(`select * from todoitems`);
    expect(tableData.length).toBe(0);
  });
});

describe("PUT /todos/:id", () => {
  beforeEach(async () => {
    await db.none(`delete from todoitems`);
    await db.none(
      `insert into todoitems(id, value, completed) values('1', 'b: todo', false)`
    );
    await db.none(
      `insert into todoitems(id, value, completed) values('2', 'a: todo', false)`
    );
    await db.none(
      `insert into todoitems(id, value, completed, completed_time) values('3', 'c: todo', true, now())`
    );
  });
  afterEach(async () => {
    await db.none(`delete from todoitems`);
  });

  it("should update todo with id to completed if true", async () => {
    const response = await request(app)
      .put("/todos/1")
      .send({ completed: true });
    expect(response.statusCode).toBe(200);
    const tableData = await db.any(`select * from todoitems where id = '1'`);
    expect(tableData[0].completed).toBe(true);
  });

  it("should update completed to todo with id", async () => {
    const response = await request(app)
      .put("/todos/3")
      .send({ completed: false });
    expect(response.statusCode).toBe(200);
    const tableData = await db.any(`select * from todoitems where id = '3'`);
    expect(tableData[0].completed).toBe(false);
  });

  it("should return 404 if todo not found", async () => {
    const response = await request(app).put("/todos/100");
    expect(response.statusCode).toBe(404);
  });
});
