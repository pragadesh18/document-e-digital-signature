var defaultWidth = 400;
var defaultHeight = 100;
var signaturePad;

var clientIP = '';
$.getJSON('//api.ipify.org?format=jsonp&callback=?', function (data) {
    clientIP = data.ip;
    console.log(clientIP);
});

$(document).ready(function () {
    signaturePad = new SignaturePad(document.getElementById('signature-pad'), {
        backgroundColor: 'rgba(255, 255, 255, 0)',
        penColor: 'rgb(0, 0, 0)'
    });
    if (window.innerWidth < (defaultWidth + 50)) {
        console.log("resize");
        //calc newWidth
        var nw = window.innerWidth - (20 * 2);
        var nr = nw/defaultWidth;
        //calc newHeight
        var nh = defaultHeight * nr;
        //change sig pad
        $("#myCanvasSignature").attr('width', nw);
        $("#myCanvasSignature").attr('height', nh);
        //change new sig pad
        $("#signature-pad").attr('width', nw);
        $("#signature-pad").attr('height', nh);
        //change as dig sig pads
        var sigs = document.getElementsByClassName('dig-sig');
        $(sigs).each(function (i, s) {
            $(s).attr('width', nw);
            $(s).attr('height', nh);
        });
    }
    
    //check if default sig is the text or the image.
    var defaultSignature = $("#UserName").val();
    console.log(defaultSignature);
    //establish ctx center
    //save signature value to png
    var ctx = document.getElementById('myCanvasSignature').getContext('2d');
    var cy = (ctx.canvas.height);
    var cx = (ctx.canvas.width);
    ctx.font = '40px \'Pacifico\', cursive';
    ctx.fillStyle = '#222222';
    ctx.textBaseline = 'center';
    ctx.textAlign = "center";
    ctx.fillText(defaultSignature, cx / 2, cy / 2 + 15);

    //Pop acknoledge disclaimer
    Acknowledge();
});

function Acknowledge() {
    $("#dialog").dialog({
        resizable: false,
        height: 375,
        width: defaultWidth + 50,
        modal: true,
        show: {
            duration: 200
        },
        hide: {
            duration: 100
        },
        buttons: {
            "Change": function () {
                $("#Signature").attr("acknowledged-data", 'false');

                $(this).dialog("close");
                Change();
            },
            "Accept": function () {
                $("#myCanvasSignature").attr("acknowledged-data", 'true');
                $(this).dialog("close");
                //And send to Database as Activity Log
                var d = new Date();
                var log = "Signature (" + $("#Signature").val() +
					") was accepted by IP " + clientIP + " at " + d.toDateString() + " " + d.toLocaleTimeString() + "<br/>";
                console.log(log);
                $('.log-file').html($('.log-file').html() + log);
            },
            "Decline": function () {
                $("#Signature").attr("acknowledged-data", 'false');
                $(this).dialog("close");
            }
        }
    });
}

function Signature(x) {
    if (($("#myCanvasSignature").attr("acknowledged-data") == "false")) {
        Acknowledge();
    }
    else {
        var SignatureItem = document.getElementById('Sig-' + x);
        if ($(SignatureItem).attr("signed-data") == "false") {
            //$(".dig-sig[sig-id-data='" + x + "']").text(s);
            var ctx = document.getElementById('myCanvasSignature').getContext('2d');
            //ctx.canvas.width  = (ctx.canvas.width * 0.5);
            //ctx.canvas.height = (ctx.canvas.height * 0.5);
            console.log(ctx.canvas.width);
            var i = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
            //console.log(i);
            $(SignatureItem).attr("signed-data", "true");
            var sigctx = SignatureItem.getContext('2d');
            sigctx.putImageData(i, 0, 0);//, sigctx.canvas.width, sigctx.canvas.height, 0,0,ctx.canvas.width*0.5, ctx.canvas.height*0.5);
            //clientIP = data.ip;
            //console.log(data.ip);
            var d = new Date();
            var log = "Signature (" + $("#Signature").val() +
				") was signed in signature (" + x + ") by IP " + clientIP + " at " + d.toDateString() + " " + d.toLocaleTimeString() + "<br/>";
            console.log(log);
            $('.log-file').html($('.log-file').html() + log);
        }
    }
}

function Change() {
    $("#change-sig").dialog({
        resizable: false,
        height: 320,
        width: defaultWidth + 50,
        modal: true,
        show: {
            duration: 200
        },
        hide: {
            duration: 100
        },
        buttons: {
            "Clear": function () {
                signaturePad.clear();
            },
            "Accept": function () {
                //Save Sig				
                var octx = document.getElementById('signature-pad').getContext('2d');
                var d1 = octx.getImageData(0, 0, octx.canvas.width, octx.canvas.height);
                var ctx = document.getElementById('myCanvasSignature').getContext('2d');
                ctx.putImageData(d1, 0, 0);
                //We are good. Close this dialog and open the acknowledge again
                $(this).dialog("close");
                Acknowledge();
                //And send to Database as Activity Log
            },
            Cancel: function () {
                $(this).dialog("close");
            }
        }
    });
}