var cv, ctx;

function pageLoaded(){

	cv = document.getElementById("cv");
	ctx = cv.getContext("2d");
	ctx.fillStyle="#000000";
	ctx.fillRect(0,0,cv.width,cv.height);


	var audioContext = new webkitAudioContext();

	navigator.webkitGetUserMedia({audio:true}, function (stream){

		var sourceNode = audioContext.createMediaStreamSource(stream);
		var finalDestinationNode = audioContext.destination;
		var gainNode = audioContext.createGainNode();
		var scriptProcessorNode = audioContext.createScriptProcessor(2048,1,1);

		gainNode.gain.value = 10;

		scriptProcessorNode.onaudioprocess = function (event){

			var inputChannel0 = event.inputBuffer.getChannelData(0);
			var outputChannel0 = event.outputBuffer.getChannelData(0);

			for(var i in inputChannel0){
				//outputChannel0[i] = inputChannel0[i];

				drawPoint( inputChannel0[i] );
			}

		}

		sourceNode.connect( gainNode );
		gainNode.connect( scriptProcessorNode );
		scriptProcessorNode.connect( finalDestinationNode ); // m'n source connecteren met de output;

		$("#gain").val( gainNode.gain.value );

		// gain change handler:
		$("#gain").change(function (event){
			gainNode.gain.value = parseInt( $("#gain").val() );
		});

		// debug brol:
		setTimeout(function(){
			console.log("audioContext.sampleRate: " + audioContext.sampleRate);
			console.log("audioContext.currentTime: " + audioContext.currentTime);

			console.log("sourceNode.numberOfInputs: " + sourceNode.numberOfInputs);
			console.log("sourceNode.numberOfOutputs: " + sourceNode.numberOfOutputs);
			console.log("finalDestinationNode.numberOfInputs: " + finalDestinationNode.numberOfInputs);
			console.log("finalDestinationNode.numberOfOutputs: " + finalDestinationNode.numberOfOutputs);
			console.log("finalDestinationNode.maxChannelCount: " + finalDestinationNode.maxChannelCount);

		}, 1000);


	}, function () {
		alert('Stream generation failed.');
	});

}

var x = 0;
function drawPoint(value){
	ctx.fillStyle="#FF0000";
	ctx.fillRect(x, cv.height/2-(value*100), 1, 1);
	x = x + 0.001;
}

$(pageLoaded); //jQuery onload



