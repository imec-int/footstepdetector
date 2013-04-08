var cv, ctx;

var footstepThreshold = 5.2;
var minFootstepDuration = 1;

var stepCounter = 0;
var maxvolume = -9999;
var minvolume = 9999;

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
		var scriptProcessorNode = audioContext.createScriptProcessor(1024,1,1);

		gainNode.gain.value = 10;

		var prevVolumeValue = 0;

		var footstepDuration = 0;
		var footstepInProgress = false;
		scriptProcessorNode.onaudioprocess = function (event){

			var inputChannel = event.inputBuffer.getChannelData(0);


			for(var i in inputChannel){
				if( !isNaN(inputChannel[i]) )
					drawPoint( inputChannel[i] );
			}


			// gemiddelde (volume) berekenen:
			var volume = 0;
			for(var i in inputChannel){
				if( !isNaN(inputChannel[i]) ){
					volume += Math.abs( inputChannel[i] );
				}
			}
			volume = volume / 1024;

			// tekenen:
			drawLine(prevVolumeValue, volume);
			prevVolumeValue = volume;

			// debugwaarden bijhouden:
			if(volume > maxvolume)
				maxvolume = volume;

			if(volume < minvolume)
				minvolume = volume;

			// voetstap detecteren:
			if(volume > footstepThreshold){
				footstepDuration++;

				if(footstepDuration > minFootstepDuration){
					stepCounter++;
				}
			}else{
				// terug resetten:
				footstepDuration = 0;
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
	ctx.fillRect(x, cv.height/4-(value*100), 1, 1);
	x = x + 0.001;
}

function drawLine(from, to){
	ctx.beginPath();
	ctx.moveTo(x, cv.height-(from*500-2400));
	ctx.lineTo(x, cv.height-(to*500-2400));
	ctx.lineWidth = 1;
	ctx.strokeStyle = '#00FF00';
	ctx.stroke();

	currentValue = (to*500-2400);
}





var currentValue = 0;

updateDebugData();

function updateDebugData(){
	$("#min").html( minvolume );
	$("#max").html( maxvolume );

	$("#value").html( currentValue );

	$("#steps").html( stepCounter );


	window.webkitRequestAnimationFrame( updateDebugData );
}

$(pageLoaded); //jQuery onload



