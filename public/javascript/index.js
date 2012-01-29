(function(){
    var clickInterval = 300;
    var callInterval = 4000;
    var drawInterval = 10;
    var WIDTH = 800;
    var HEIGHT = 600;
    var socket = io.connect(window.location.protocol + "//" + window.location.host);
    var clicks = 0;
    var clicked = false;
    var alertTimes = 0;
    var mice = [];
    var newMice = [];
    var deltas = [];
    var pos = {x:Math.random()*WIDTH, y:Math.random()*HEIGHT};
    var color = "#000";
    //Data gathering
    var myID = -1;
    var ctx;
    var size = 0;
    
    var transferData = function(){
        
        socket.emit("post", {"clicks": clicks, "color": color, "pos": pos}, function(data){
            myID = data.myID;
            var oldMice = mice;
            mice = [];
            console.log(data);
            
            for(var i = 0; i<data.mice.length; i++){
                var id = data.mice[i].id;
                if(id !== myID){
                    var color = data.mice[i].color;
                    var size = data.mice[i].size;
                    var pos = data.mice[i].pos;
                    if(typeof oldMice[id] === "undefined"){
                        mice[id] = {color: color, size: 0, pos: {x:WIDTH, y:Math.random()*HEIGHT}};
                        deltas[id] = {ds: 0, dx: 0, dy: 0};
                    }else{
                        mice[id] = oldMice[id];
                    }
                    mice[id].color = color;
                    deltas[id] = {dx: (mice[id].pos.x-pos.x)/(callInterval/drawInterval),
                                 dy: (mice[id].pos.y-pos.y)/(callInterval/drawInterval),
                                 ds: (mice[id].size-size)/(callInterval/drawInterval),
                                };
                    newMice[id] = data.mice[i];
                }
                
            }
        });
    }
    
    var watchClicks = function(){
        alertTimes++;
        if(clicked){
            clicks++;
            size++;
            clicked = false;
        }
        if(alertTimes>=(callInterval/clickInterval)){
            transferData();
            clicks = 0;
            alertTimes = 0;
        }
    }
    
    var closer = function(orig, delta, target){
        return (Math.abs(target-(orig - delta))<Math.abs(target-orig));
    }
    
    var drawMouse = function(color){
        // layer1/Path
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(0.0, 140.4);
        ctx.lineTo(0.0, 9.1);
        ctx.lineTo(87.8, 104.3);
        ctx.lineTo(49.0, 104.3);
        ctx.lineTo(76.9, 167.6);
        ctx.lineTo(61.2, 176.5);
        ctx.lineTo(32.3, 112.3);
        ctx.lineTo(0.0, 140.4);
        ctx.closePath();
        ctx.fillStyle = "rgb(147, 149, 151)";
        ctx.fill();

        // layer1/Path
        ctx.beginPath();
        ctx.moveTo(5.2, 136.5);
        ctx.lineTo(5.2, 5.1);
        ctx.lineTo(93.0, 100.4);
        ctx.lineTo(54.2, 100.4);
        ctx.lineTo(82.1, 163.7);
        ctx.lineTo(66.4, 172.5);
        ctx.lineTo(37.5, 108.3);
        ctx.lineTo(5.2, 136.5);
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();
        ctx.lineWidth = 4.0;
        ctx.strokeStyle = "rgb(255, 255, 255)";
        ctx.stroke();
        ctx.restore();
    }
    var getScale = function(x){
        return (Math.log((x+50))-3.8)
    }
    var draw = function(){
        ctx.fillStyle = "#FFF";  
        ctx.fillRect(0, 0, WIDTH, HEIGHT);
        for(var i in mice){
            if(i !== myID){
                if(closer(mice[i].pos.x, deltas[i].dx, newMice[i].pos.x)){
                    mice[i].pos.x -= deltas[i].dx;
                }
                if(closer(mice[i].pos.y, deltas[i].dy, newMice[i].pos.y)){
                    mice[i].pos.y -= deltas[i].dy;
                }
                if(closer(mice[i].size, deltas[i].ds, newMice[i].size)){
                    mice[i].size -= deltas[i].ds;
                }
                var sc = getScale(mice[i].size)
                ctx.save();
                ctx.translate(mice[i].pos.x, mice[i].pos.y);
                ctx.scale(sc, sc);
                drawMouse(mice[i].color);
                ctx.restore();
            }
        }
        ctx.save();
        var sc =  getScale(size);
        ctx.translate(pos.x, pos.y);
        ctx.scale(sc, sc);
        drawMouse(color);
        ctx.restore();
    }
    
    
    
    //Draw Loop
  
    transferData();
    
    $(function(){
        $('canvas').click(function(evt){
            clicked = true;
        });
        $('canvas').mousemove(function(evt){
            pos.x = evt.pageX - $('canvas')[0].offsetLeft;
            pos.y = evt.pageY - $('canvas')[0].offsetTop;
        });
        var canvas = $('canvas')[0];  
        ctx = canvas.getContext("2d");
        setInterval(watchClicks, clickInterval);
        setInterval(draw, drawInterval)
        
        var myColorPicker = ColorPicker(
                document.getElementById('slide'),
                document.getElementById('picker'),
                function(hex, hsv, rgb) {
                  color = hex;
                });
    });
    
})();

