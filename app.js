//Express JS CORE Path

const express = require("express");
const app = express();
const path = require("path");
const dbPath = path.join(__dirname, "todoApplication.db");

app.use(express.json());

// Sqlite sqlite3

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
let db = null;

// initializing Database and server
const initializeDatabaseAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running At http://localhost:3000/");
    });
  } catch (e) {
    console.log(`Db Error: ${e.Message}`);
    process.exit(1);
  }
};

initializeDatabaseAndServer();

//API-1 Scenarios

//Scenario-1 Based on Status query assume search_q=""

const hasStatusIsPresent = (requestStatus) => {
  return requestStatus.status !== undefined;
};

//Scenario-2 based on Priority Query assume search_q=""

const hasPriorityIsPresent = (requestPriority) => {
  return requestPriority.priority !== undefined;
};

//Scenario-3 Both the status and priority are given assume search_q=""

const hasPriorityAndStatusIsPresent = (requestStatusAndPriority) => {
  return (
    requestStatusAndPriority.status !== undefined &&
    requestStatusAndPriority.priority !== undefined
  );
};

//API-1 Get the details based on the query parameters;

app.get("/todos/", async (request, response) => {
  let todoQuery = null;
  const { status, priority, search_q = "" } = request.query;
  switch (true) {
    case hasPriorityAndStatusIsPresent(request.query):
      todoQuery = `
            SELECT * FROM todo
            WHERE todo LIKE '%${search_q}%' AND
            status = '${status}' AND priority = '${priority}';`;
      break;
    case hasStatusIsPresent(request.query):
      todoQuery = `
            SELECT * FROM todo
            WHERE todo LIKE '%${search_q}%' AND
            status = '${status}';`;
      break;
    case hasPriorityIsPresent(request.query):
      todoQuery = `
            SELECT * FROM todo
            WHERE todo LIKE '%${search_q}%' AND
            priority = '${priority}';`;
      break;
    default:
      todoQuery = `
            SELECT * FROM todo
            WHERE todo LIKE '%${search_q}%';`;
      break;
  }

  const detailsOfTodo = await db.all(todoQuery);
  response.send(detailsOfTodo);
});

//API-2 Get the details of specific todo based on todo id

app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getIdTodoQuery = `
    SELECT * FROM todo
    WHERE id = ${todoId}`;
  const idTodoDetails = await db.get(getIdTodoQuery);
  response.send(idTodoDetails);
});

//API-3 Create the details in the todo table

app.post("/todos/", async (request, response) => {
  const detailsToCreateTodo = request.body;
  const { id, todo, priority, status } = detailsToCreateTodo;
  const createTodoQuery = `
    INSERT INTO todo (id, todo, priority, status)
    VALUES (
         ${id},
        '${todo}',
        '${priority}',
        '${status}');`;
  await db.run(createTodoQuery);
  response.send("Todo Successfully Added");
});

//API-4 Scenarios

// Scenario-1 status check:
const hasStatusObjectPresent = (statusObject) => {
  return statusObject.status !== undefined;
};

// Scenario-2 priority check:
const hasPriorityObjectPresent = (priorityObject) => {
  return priorityObject.priority !== undefined;
};

// // Scenario-3 todo check:
// const hasTodoObjectPresent = (todoObject) => {
//   return todoObject.todo !== undefined;
// };

//API-4 Update the particular column value based todoId

app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const updateObject = request.body;
  let valueToUpdateQuery = null;
  switch (true) {
    case hasStatusObjectPresent(updateObject):
      valueToUpdateQuery = `
          UPDATE todo
          SET
          status ='${updateObject.status}'
          WHERE id =${todoId};`;
      await db.run(valueToUpdateQuery);
      response.send("Status Updated");
      break;
    case hasPriorityObjectPresent(updateObject):
      valueToUpdateQuery = `
          UPDATE todo
          SET
          priority ='${updateObject.priority}'
          WHERE id =${todoId};`;
      await db.run(valueToUpdateQuery);
      response.send("Priority Updated");
      break;
    default:
      valueToUpdateQuery = `
          UPDATE todo
          SET
          todo ='${updateObject.todo}'
          WHERE id =${todoId};`;
      await db.run(valueToUpdateQuery);
      response.send("Todo Updated");
      break;
  }
});

//API-5  Delete the todo based on todo id

app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deleteIdTodoQuery = `
    DELETE FROM todo WHERE id =${todoId};`;
  await db.run(deleteIdTodoQuery);
  response.send("Todo Deleted");
});

module.exports = app;
