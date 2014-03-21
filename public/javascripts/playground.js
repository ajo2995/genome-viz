function hilbertPoint(context,d,n,scale,size) {
    var t=d;
    var x=0;
    var y=0;
    for(var s=1; s<n; s*=2) {
        var rx = 1 & (t/2);
        var ry = 1 & (t ^ rx);
        if (ry == 0) {
            if (rx == 1) {
                x = s-1 - x;
                y = s-1 - y;
            }
            var tmp = x;
            x = y;
            y = tmp;
        }
        x += s * rx;
        y += s * ry;
        t /= 4;
    }
    context.fillRect(x*scale,y*scale,size,size);
}

function paintHilbertGrid() {
    var hilbertCanvas = document.getElementById('hilbertGrid');
    var context = hilbertCanvas.getContext('2d');
    var w = hilbertCanvas.width;
    var h = hilbertCanvas.height;
    context.clearRect(0, 0, h, w);
    context.fillStyle = 'rgba(0,0,0,0.3)';
    // each box in the matrix is 7x7 with 1 pixel separating them
    var n = w/8;
    for(var i=0; i<n; i++) {
        for(var j=0; j<n; j++) {
            context.fillRect(i*8,j*8,7,7);
        }
    }
    var stride = 73840631/(n*n);
    var url = '/data/1/dist?column=pos&part=1'
    +"&begin=0&end=73840631&stride="+stride;
    $.getJSON(url, function(res) {
        var max=res.counts[0];
        for(var i=0;i<res.bounds.length;i++) {
            if (res.counts[i] > max) max = res.counts[i];
        }
        for(var i=0;i<res.bounds.length;i++) {
            context.fillStyle = 'rgba(200,0,0,'+res.counts[i]/max+')';
            hilbertPoint(context,Math.floor(res.bounds[i]/stride),n,8,7);
        }
    });
}
function paintHilbertImage() {
    var hilbertCanvas = document.getElementById('hilbertImage');
    var context = hilbertCanvas.getContext('2d');
    var w = hilbertCanvas.width;
    var h = hilbertCanvas.height;
    context.clearRect(0, 0, h, w);

    var n = w/2;
    var stride = 73840631/(n*n);
    var url = '/data/1/dist?column=pos&part=1'
    +"&begin=0&end=73840631&stride="+stride;
    $.getJSON(url, function(res) {
        var max=res.counts[0];
        for(var i=0;i<res.bounds.length;i++) {
            if (res.counts[i] > max) max = res.counts[i];
        }
        for(var i=0;i<res.bounds.length;i++) {
            context.fillStyle = 'rgba(200,0,0,'+res.counts[i]/max+')';
            hilbertPoint(context,Math.floor(res.bounds[i]/stride),n,2,2);
        }
    });
}
function drawSparkline() {
    var canvas = document.getElementById('sparkline');
    var context = canvas.getContext('2d');
    var w = canvas.width;
    var h = canvas.height;
    context.clearRect(0,0,w,h);
    var nbins=w;
    var stride = 73840631/nbins;
    var url = '/data/1/dist?column=pos&part=1'
    +"&begin=0&end=73840631&stride="+stride;
    $.getJSON(url, function(res) {
        var max=res.counts[0];
        for(var i=0;i<res.bounds.length;i++) {
            if (res.counts[i] > max) max = res.counts[i];
        }
        context.beginPath();
        context.moveTo(0,h);
        for(var i=0;i<res.bounds.length;i++) {
            context.fillStyle = 'rgba(200,0,0,'+res.counts[i]/max+')';
            var x = Math.floor(res.bounds[i]/stride);
            var y = h - Math.floor(h*res.counts[i]/max);
            context.lineTo(x,y);
        }
        context.lineTo(w,h);
        context.stroke();
        context.closePath();
    });
}
function drawHeatmap() {
    var canvas = document.getElementById('heatmap');
    var context = canvas.getContext('2d');
    var w = canvas.width;
    var h = canvas.height;
    context.clearRect(0,0,w,h);
    var nbins=w;
    var stride = 73840631/nbins;
    var url = '/data/1/dist?column=pos&part=1'
    +"&begin=0&end=73840631&stride="+stride;
    $.getJSON(url, function(res) {
        var max=res.counts[0];
        for(var i=0;i<res.bounds.length;i++) {
            if (res.counts[i] > max) max = res.counts[i];
        }
        for(var i=0;i<res.bounds.length;i++) {
            context.fillStyle = 'rgba(200,0,0,'+res.counts[i]/max+')';
            context.fillRect(Math.floor(res.bounds[i]/stride),0,1,h);
        }
    });
}
function init() {
    drawSparkline();
    drawHeatmap();
    paintHilbertGrid();
    paintHilbertImage();
}