const Hapi = require('hapi');
const Path = require('path');
const Inert = require('inert');
const xmlbuilder = require('xmlbuilder');
const fs = require('fs');

const App = new Hapi.Server();

if (!String.prototype.padEnd) {
  String.prototype.padEnd = function padEnd(targetLength,padString) {
      targetLength = targetLength>>0; //floor if number or convert non-number to 0;
      padString = String((typeof padString !== 'undefined' ? padString : ' '));
      if (this.length > targetLength) {
          return String(this);
      }
      else {
          targetLength = targetLength-this.length;
          if (targetLength > padString.length) {
              padString += padString.repeat(targetLength/padString.length); //append to original to ensure we are longer than needed
          }
          return String(this) + padString.slice(0,targetLength);
      }
  };
}

const padNumber = (number, length) => {
  var str = '' + number;

  while (str.length < length) {
      str = '0' + str;
  }
 
  return str;
}

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

      var northData = {},
        southData = 
      
      request.payload.southSequences.sequences.map((seq, index) => {            
        northData.colorData = '';

        request.payload.sequenceData[seq.id].colorList.map((color, index) => {
          northData.colorData += request.payload.sequenceData[seq.id][color].color.replace('#', '') + '@' + padNumber(request.payload.sequenceData[seq.id][color].duration, 4) + ';';
        });
        
        northData.program = {
          'serialN': padNumber((index + 1), 2), 
          'name': request.payload.sequenceData[seq.id].displayName.padEnd(20, '~'), 
          'elements': padNumber(request.payload.sequenceData[seq.id].colorList.length, 4), 
          'speed': padNumber(request.payload.sequenceData[seq.id].fadeSpeed, 3) + '%'
        
        };

        return northData;       
      });

      request.payload.southSequences.sequences.map((seq, index) => {            
        southData.colorData = '';

        request.payload.sequenceData[seq.id].colorList.map((color, index) => {
          southData.colorData += request.payload.sequenceData[seq.id][color].color.replace('#', '') + '@' + padNumber(request.payload.sequenceData[seq.id][color].duration, 4) + ';';
        });
        
        southData.program = {
          'serialS': padNumber((index + 1), 2), 
          'name': request.payload.sequenceData[seq.id].displayName.padEnd(20, '~'), 
          'elements': padNumber(request.payload.sequenceData[seq.id].colorList.length, 4), 
          'speed': padNumber(request.payload.sequenceData[seq.id].fadeSpeed, 3) + '%'
        
        };

        return southData;       
      });
      
      let xmlFile = xmlbuilder.create('SPEEVERS_LIGHT_DATA', {'version': '1.0', 'encoding': 'UTF-8'})
        .ele('STAMP', {'user': request.payload.user.padEnd(20, '~'), 'date': request.payload.todays_date, 'time': request.payload.todays_time}, ' ').up()
        .ele('SETTINGS', {'switch_time': request.payload.switch_time, 'program_looping': request.payload.program_looping ? 1 : 0, 'programs_north': padNumber(request.payload.northSequences.sequences.length, 2), 'programs_south': padNumber(request.payload.southSequences.sequences.length, 2), 'start_fst': request.payload.start_first ? 1 : 0, 'place_holder': '################################################################################################################################################################################################################################################################################################################################################################################################################'}, ' ').up()
        .ele('PROGRAMS_NORTH')
          .ele('PROGRAM', northData.program)
            .ele('PROG_DATA', {}, northData.colorData).up()
          .up()
        .up()
        .ele('PROGRAMS_SOUTH')
          .ele('PROGRAM', southData.program)
            .ele('PROG_DATA', {}, southData.colorData).up()
          .up()
        .up().end();

      fs.writeFile(request.payload.user + '-speevers.xml', xmlFile, (err) => {
        if (err) throw err;

        console.log('boom');
      });  

      return reply().code(204);
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