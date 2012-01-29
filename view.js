exports.view = function(app){
    var db = {}
    var io = app.socketIO;
    db.connections = [];
    db.mice = [];
    db.users = 0;
    
    var alertAll = function(){
        console.log("alerting all");
        for(var i = 0; i<db.connections.length; i++){
            db.connections[i].pos = i;
        }
    }
    var disconnect = function(pos){
        db.connections.splice(pos, 1);
        db.mice.splice(pos, 1);
        alertAll();
    };
    return {
        index: function(req, res){
            res.render('index.jade');
        },
      
        connect: function(socket){
            db.connections.push(socket);
            socket.pos = db.connections.length-1;
            socket.mouse = {"id": db.users++, "size": 0, "color": "#000", "pos": {"x":Math.random()*800, "y":Math.random()*600}};
            db.mice.push(socket.mouse);
            socket.on('disconnect', function () {
                console.log("disconnecting");
                disconnect(socket.pos);
            });
            socket.on('post', function (data, fn) {
                //need to check if date is more than 10 seconds later
                socket.mouse.size += Math.min(100, data.clicks);
                socket.mouse.color = data.color;
                socket.mouse.pos = data.pos;
                fn({myID: socket.mouse.id, mice: db.mice});
                console.log("emitted");
            });
        }
    }
}