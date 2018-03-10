const Hapi = require('hapi');
const Path = require('path');
const Inert = require('inert');

const App = new Hapi.Server();

App.connection({
  port: 9000
});

App.register([Inert], err => {
  if (err) {
    throw err
  }

  App.route({
    method: 'GET',
    path: '/{path*}',
    handler: {
      directory: {
        path: Path.resolve(__dirname, "..", "build"),
        listing: false,
        index: true
      }
    }
  });

  //Create a new entry
  App.route({
    method: 'POST',
    path: '/generateXML',
    handler: function (request, reply) {
      console.log('request payload is ', request.payload);

      
    }
  });

  App.start(err => {
    if (err) {
      throw err
    }

    console.log(`Server running at ${App.info.uri}`)
  });
});

module.exports = App;