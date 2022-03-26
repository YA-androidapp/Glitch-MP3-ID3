// Copyright (c) 2022 YA-androidapp(https://github.com/YA-androidapp) All rights reserved.


const path = require("path");
const fs = require('fs');
const pump = require('pump');


const fastify = require("fastify")({
  logger: true
});

const fastifyMultipart = require('fastify-multipart');

fastify.register(require("fastify-static"), {
  root: path.join(__dirname, "public"),
  prefix: "/"
});

fastify.register(require("fastify-formbody"));

fastify.register(require("point-of-view"), {
  engine: {
    handlebars: require("handlebars")
  }
});

fastify.register(fastifyMultipart);

const mm = require('music-metadata');


/**
* Our home page route
*
* Returns src/pages/index.hbs with data built into it
*/
fastify.get("/", function (request, reply) {
  // The Handlebars code will be able to access the parameter values and build them into the page
  reply.view("/src/pages/index.hbs");
});

/**
* Our POST route to handle and react to form submissions
*
* Accepts body data indicating the user choice
*/
fastify.post("/", async function (request, reply) {
  const data = await request.file();

  try {
    const metadata = await mm.parseStream(data.file, { mimeType: data.mimetype });

    reply
      .code(200)
      .header('Content-Type', 'application/json; charset=utf-8')
      .send({
        metadata: metadata
      });
  } catch (error) {
    console.error(error.message);
  }
});

// Run the server and report out to the logs
fastify.listen(process.env.PORT, '0.0.0.0', function (err, address) {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  console.log(`Your app is listening on ${address}`);
  fastify.log.info(`server listening on ${address}`);
});
