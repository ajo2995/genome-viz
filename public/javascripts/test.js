// some local variables
var genomeLength = 0; // nucleotides
var gapLength = Math.PI / 90;    // radians
var tracks = new Object();
var chrLengths = new Object();
var chrStarts = new Object();
var nChrs = 0;
var axisWidth = 2;
var radiansPerBase;
var trackWidth = 20;
var trackSpacing = 5;

var canvas;
var ctx;
var x;
var y;
var radius;

function initViz() {
    canvas = document.getElementById('drawhere');
    ctx = canvas.getContext('2d');
    x = canvas.width / 2;
    y = x;
    radius = 0.92*x;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    var startAngle = 0;
    ctx.lineWidth = axisWidth;
    ctx.strokeStyle = 'black';

    radiansPerBase = (2*Math.PI - nChrs*gapLength) / genomeLength; 
    for(var chr in chrLengths) {
        chrStarts[chr] = startAngle;
        ctx.beginPath();
        var arcLength = chrLengths[chr]*radiansPerBase;
        ctx.arc(x,y,radius,startAngle,startAngle + arcLength, false);
        ctx.stroke();
        var mid = startAngle + arcLength/2;
        startAngle += arcLength + gapLength;
        ctx.fillText(chr,x+1.05*radius*Math.cos(mid),y+1.05*radius*Math.sin(mid));
    }
}

function addTrack(setID,column,where) {
    // calculate the radius for this track
    var r = radius;
    for(var t in tracks) {
        r -= trackSpacing;
        r -= trackWidth;
    }
    r -= trackWidth;
    var key = setID+column+where;
    tracks[key] = new Object();
    ctx.lineWidth = trackWidth;
    // ctx.beginPath();
    // ctx.arc(x,y,r,0,2*Math.PI,false);
    // ctx.stroke();
    var max=0;
    var chrCounts = new Object();
    var stride = Math.floor(genomeLength/(Math.PI*r));
    var remaining = nChrs;
    for(var chr in chrLengths) {
        (function(c){
            var url = '/data/'+setID+'/dist?column='+column+'&part='
            +c+"&begin=0&end="
            +chrLengths[c]+"&stride="+stride;
            if (where) url += '&where='+where;
            $.getJSON(url, function(res) {
                chrCounts[c] = [];
                for(var i=0;i<res.bounds.length;i++) {
                    chrCounts[c][i] = res.counts[i];
                    if (res.counts[i] > max) max = res.counts[i];
                }
                remaining--;
                if (remaining === 0) {
                    console.log(max);
                    for(var chr2 in chrLengths) {
                        var startAngle = chrStarts[chr2];
                        var arcLength = stride*radiansPerBase;
                        for(var i=0;i<chrCounts[chr2].length;i++) {
                            ctx.beginPath();
                            ctx.arc(x,y,r,startAngle,startAngle + arcLength, false);
                            var norm = chrCounts[chr2][i]/max;
                            ctx.strokeStyle = 'rgba(0,0,0,'+norm+')';
                            ctx.stroke();
                            startAngle += arcLength;
                        }
                    }
                }
            });
        })(chr)
    }
}

function changeGenome(genomeID) {
    var dataset = document.getElementById('dataset');
    $(dataset).html('');
    // lookup data sets
    var s = $('<select id="dataSel"/>');
    s.append($('<option/>').attr('value',0).text('Select dataset'));
    $.getJSON("/genome/"+genomeID+"/datasets", function(res) {
        $.each(res, function(key, value) {
            s.append($('<option/>').attr('value',value.setID)
            .text(value.description));
        });
        $(dataset).append(s);
        $(dataset).append($('<input id="column"/>'));
        $(dataset).append($('<input id="where"/>'));
        $(dataset).append($('<button/>').text('Add')
        .click(function() {
            var dataSel = document.getElementById('dataSel');
            var setID = $(dataSel).val();
            var column = document.getElementById('column').value;
            var where = document.getElementById('where').value;
            if (! tracks.hasOwnProperty(setID + column + where)) addTrack(setID,column,where);
            if (setID == 0) {
                myimage = new Image();
                myimage.onload = function() {
                    ctx.drawImage(myimage, x-300, y-200);
                }
                myimage.src = 'http://images.pictureshunt.com/pics/p/porky_pig_thats_all_folks-5172.jpg';
            }
        }));
    });
    // lookup chromosome lengths
    $.getJSON("/genome/"+genomeID+"/chromosomes", function(res) {
        genomeLength=0;
        // empty tracks and chrLengths
        tracks = {};
        chrLengths = {};
        nChrs=0;
        for(var chr in res) {
            chrLengths[chr] = res[chr];
            genomeLength += res[chr];
            nChrs++;
        }
        initViz();
    });
}

function init() {
    var genome = document.getElementById('genome');
    var s = $('<select/>');
    s.change(function() {
        changeGenome($(this).val());
    });
    s.append($('<option/>').attr('value',0).text('Select genome'));
    $.getJSON( "/genome", function(res) {
        $.each(res, function(key, value) {
            s.append($('<option/>').attr('value',value.genomeID)
            .text(value.species + ' -- ' + value.version));
        });
        $(genome).append(s);
    });
}