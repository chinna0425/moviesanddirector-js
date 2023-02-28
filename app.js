const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const db_path = path.join(__dirname, "moviesData.db");
const app = express();
app.use(express.json());
let db = null;
const initializationofdbandserver = async () => {
  try {
    db = await open({
      filename: db_path,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("server is running at http:localhost:3000");
    });
  } catch (error) {
    console.log(`DB error is ${error.message}`);
    process.exit(1);
  }
};

initializationofdbandserver();

//API GET

let convertintoformat = (result) => {
  myarray = [];
  for (let i = 0; i < result.length; i++) {
    let vals = {
      movieName: result[i].movie_name,
    };
    myarray.push(vals);
  }
  return myarray;
};

app.get("/movies/", async (request, response) => {
  let query = `
    SELECT * FROM movie;`;
  let res = await db.all(query);
  response.send(convertintoformat(res));
});

// API POST

app.post("/movies/", async (request, response) => {
  let { directorId, movieName, leadActor } = request.body;
  let query = `
    INSERT INTO
    movie(director_id,movie_name,lead_actor)
    VALUES(${directorId},'${movieName}','${leadActor}');`;
  let res = await db.run(query);
  response.send("Movie Successfully Added");
});

// API GET

app.get("/movies/:movieId/", async (request, response) => {
  let { movieId } = request.params;
  let query = `
    SELECT * 
    FROM movie 
    WHERE 
    movie_id=${movieId};`;
  let res = await db.get(query);
  response.send({
    movieId: res.movie_id,
    directorId: res.director_id,
    movieName: res.movie_name,
    leadActor: res.lead_actor,
  });
});

// API PUT

app.put("/movies/:movieId/", async (request, response) => {
  let { movieId } = request.params;
  let { directorId, movieName, leadActor } = request.body;
  let query = `
    UPDATE movie SET director_id=${directorId},
    movie_name='${movieName}',
    lead_actor='${leadActor}'
    WHERE 
    movie_id=${movieId};`;
  await db.run(query);
  response.send("Movie Details Updated");
});

// API DELETE

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const query = `
    DELETE
    FROM movie
    WHERE 
    movie_id=${movieId};`;
  let res = await db.run(query);
  response.send("Movie Removed");
});

// API GET

let convertintodirector = (result) => {
  let myarray = [];
  for (let i = 0; i < result.length; i++) {
    let r = {
      directorId: result[i].director_id,
      directorName: result[i].director_name,
    };
    myarray.push(r);
  }
  return myarray;
};

app.get("/directors/", async (request, response) => {
  let query = `
    SELECT * FROM director;`;
  let res = await db.all(query);
  response.send(convertintodirector(res));
});

// API GET

let convertintotdirectorssingle = (result) => {
  let myArray = [];
  for (let i = 0; i < result.length; i++) {
    let re = {
      movieName: result[i].movie_name,
    };
    myArray.push(re);
  }
  return myArray;
};

app.get("/directors/:directorId/movies/", async (request, response) => {
  let { directorId } = request.params;
  let query = `
    SELECT
    *
    FROM movie
    WHERE director_id=${directorId};`;
  let res = await db.all(query);
  response.send(convertintotdirectorssingle(res));
});

module.exports = app;
