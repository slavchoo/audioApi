LanguageApp.controller('SpeechCorrectionCtrl', function ($rootScope, $scope) {

    $scope.recordInProgress = false;
    var audio = new Audio();
    var originalAudio = new Audio();

    window.AudioContext = window.AudioContext || window.webkitAudioContext || window.mozAudioContext;
    var createSrc = window.webkitURL ? window.webkitURL.createObjectURL : function(stream) {return stream;};

    // this is to store a reference to the input so we can kill it later
    var liveSource;
    // creates an audiocontext and hooks up the audio input
    $scope.connectAudioInToSpeakers = function () {
        var context = new AudioContext();
        navigator.webkitGetUserMedia({audio: true}, function (stream) {
            console.log("Connected live audio input");
            liveSource = context.createMediaStreamSource(stream);
            liveSource.connect(context.destination);
            $scope.$apply(function() {
                $scope.recordInProgress = true;
            });
            audio.src = createSrc(stream);
        });
    };

    // disconnects the audio input
    $scope.makeItStop = function () {
        console.log("killing audio!");

        $scope.recordInProgress = false;

        liveSource.disconnect();
    };

    $scope.playMe = function() {
        console.log('play');
        audio.play();
    };

    $scope.playOriginal = function() {
        originalAudio.play();
    }
});