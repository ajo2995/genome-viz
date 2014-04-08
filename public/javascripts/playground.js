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
        var max=res.count[0];
        for(var i=0;i<res.pos.length;i++) {
            if (res.count[i] > max) max = res.count[i];
        }
        for(var i=0;i<res.pos.length;i++) {
            context.fillStyle = 'rgba(200,0,0,'+res.count[i]/max+')';
            hilbertPoint(context,Math.floor(res.bounds[i]/stride),n,8,7);
        }
    });
}
function paintHilbertImage() {
    var hilbertCanvas = document.getElementById('hilbertImage');
    var context = hilbertCanvas.getContext('2d');
    var w = hilbertCanvas.width;
    var h = hilbertCanvas.height;
    context.clearRect(0, 0, w, h);

    var n = w/2;
    var stride = 73840631/(n*n);
    var url = '/data/1/dist?column=pos&part=1'
    +"&begin=0&end=73840631&stride="+stride;
    $.getJSON(url, function(res) {
        var max=res.count[0];
        for(var i=0;i<res.pos.length;i++) {
            if (res.count[i] > max) max = res.count[i];
        }
        for(var i=0;i<res.pos.length;i++) {
            context.fillStyle = 'rgba(200,0,0,'+res.count[i]/max+')';
            hilbertPoint(context,Math.floor(res.pos[i]/stride),n,2,2);
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
        var max=res.count[0];
        for(var i=0;i<res.pos.length;i++) {
            if (res.count[i] > max) max = res.count[i];
        }
        context.beginPath();
        context.moveTo(0,h);
        for(var i=0;i<res.pos.length;i++) {
            context.fillStyle = 'rgba(200,0,0,'+res.count[i]/max+')';
            var x = Math.floor(res.pos[i]/stride);
            var y = h - Math.floor(h*res.count[i]/max);
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
        var max=res.count[0];
        for(var i=0;i<res.pos.length;i++) {
            if (res.count[i] > max) max = res.count[i];
        }
        for(var i=0;i<res.pos.length;i++) {
            context.fillStyle = 'rgba(200,0,0,'+res.count[i]/max+')';
            context.fillRect(Math.floor(res.pos[i]/stride),0,1,h);
        }
    });
}
function drawScatter() {
    var canvas = document.getElementById('scatter');
    var context = canvas.getContext('2d');
    var w = canvas.width;
    var h = canvas.height;
    context.clearRect(0,0,w,h);
    var url = '/data/baseball/dist2D?column1=height&begin1=0&end1=99&stride1=1'
    +'&column2=weight&begin2=0&end2=499&stride2=5';
    $.getJSON(url, function(res) {
        var max=0;
        for(var i=0;i<res.count.length;i++) {
            if (res.count[i]>max) max = res.count[i];
        }
        for(var xi=0;xi<res.height.length;xi++) {
            var x = res.height[xi];
            for(var yi=0;yi<res.weight.length;yi++) {
                var y = res.weight[yi]/5;
                var ci = xi*res.weight.length + yi;
                if (res.count[ci]>0) {
                    context.fillStyle = 'rgba(0,0,0,'+res.count[ci]/max+')';
                    context.fillRect(x,h-y,1,1);
                }
            }
        }
    });
}
function drawStackedHist() {
    var can = document.getElementById('stackedHist');
    var ctx = can.getContext('2d');
    var w = can.width;
    var h = can.height;
    ctx.clearRect(0,0,w,h);
    // need a 2D distribution of position and methylation ratio
    var stride1 = 73840631/w;
    var url = '/data/1/dist2D?part=1&column1=pos&begin1=0&end1=73840631&stride1='
    + stride1 + '&column2=ratio&begin2=0&end2=1&stride2=0.2';
    $.getJSON(url, function(res) {
        // iterate over every pos bin to find the max total count
        // iterate again, drawing each histogram (back to front)
        // can this be done in one pass with 5 paths in different layers? 
    });
}
function init() {
    // drawStackedHist();
    drawSparkline();
    drawHeatmap();
    // paintHilbertGrid();
    paintHilbertImage();
    drawScatter();
}