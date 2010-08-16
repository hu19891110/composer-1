var connect    = require("connect"),
    mongo      = require("mongoose").Mongoose,
    db         = mongo.connect('mongodb://localhost/composer'),
    Flow, Node;

mongo.model('Flow',{
  collection : "flows",
  properties : ["name"],
  indexes    : ["name"]
});
mongo.model('Node', {
  collection : "nodes",
  properties : ["name", "code"],
  indexes    : ["name"]
});
Flow = db.model('Flow');
Node = db.model('Node');

connect.createServer.apply(connect, [
  connect.logger(),
  connect.bodyDecoder(),
  connect.router(function(app) {
    app.get("/flows/:name", function(req, res, next) {
      Flow.find({name: req.params.name}).all(function(cursor) {
        if (!cursor || cursor.length === 0) {
          res.writeHead(404, {'Content-type':'application/json'});
          res.end(JSON.stringify({code: 404, body: "Not Found"}));
        } else {
          res.writeHead(200, {'Content-type':'application/json'});
          res.end(cursor.pop().toJSON());
        }
      });
    });

    app.post("/flows", function(req, res, next) {
      if (req.body) {
        req.body.name = "THEFLOW";
        req.body._id = 123123123;
        var flow = new Flow(req.body, true);

        flow.save(function() {
          res.writeHead("201",{"Content-type" : "application/json"});
          res.end('{ "status": 201}');
        });
      }
    });


    app.get("/nodes", function(req, res, next) {
      Node.find().all(function(cursor) {
        res.writeHead(200, {"Content-type": "application/json"});
        var result = [];
        cursor.forEach(function(obj) {
          result.push(obj.toObject());
        });
        res.end(JSON.stringify(result));
      });
    });

    app.post("/nodes", function(req, res, next) {
      if (req.body) {
        var node = new Node(req.body, true);
        node.save(function() {
          res.writeHead("201", {"Content-type" : "application/json"});
          res.end('{ "status": 201 }');
        });
      }
    });

    app.get("/nodes/:node", function(req, res, next) {
      var node = req.params.node.replace("%20", " ");
      Node.find({name: node}).one(function(cursor) {
        if (!cursor || cursor.length === 0) {
          res.writeHead(404, {"Content-type": "application/json"});
          res.end(JSON.stringify({code: 404, body: "Not Found"}));
        } else {
          res.writeHead(200, {"Content-type": "application/json"});
          res.end(cursor[0].toJSON());
        }
      });
    });

    app.put("/nodes/:node", function(req, res, next) {
      if (req.body) {
        var node = req.params.node.replace("%20", " ");
        Node.find({name: node}).one(function(cursor) {
          console.log(cursor);
          if (!cursor || cursor.length === 0) {
            res.writeHead(404, {"Content-type": "application/json"});
            res.end(JSON.stringify({code: 404, body: "Not Found"}));
          } else {
            cursor.code = req.body.code;
            cursor.save(function() {
              res.writeHead("200", {"Content-type" : "application/json"});
              res.end('{ "status": 204 }');
            });
          }
        });
      }
    });
  }),

  connect.staticProvider(__dirname + '/../'),
  connect.staticProvider(__dirname + '/../../')
]).listen(3000);
