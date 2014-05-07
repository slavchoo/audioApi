LanguageApp.controller('VideoTestCtrl', function ($rootScope, $scope) {
    $scope.data = {
        file: '/video/mov_bbb.mp4'
    };

    var video = document.getElementById("video-1");
    video.src = $scope.data.file;

    $scope.playDictor = function() {
        video.play();
    };


    var UserVideo = document.getElementById("video-2");
    var videoObj = { "video": true };
    var errBack = function(error) {
        console.log("Video capture error: ", error.code);
    };

    // Put video listeners into place
    if(navigator.getUserMedia) { // Standard
        navigator.getUserMedia(videoObj, function(stream) {
            UserVideo.src = stream;
            UserVideo.play();
        }, errBack);
    } else if(navigator.webkitGetUserMedia) { // WebKit-prefixed
        navigator.webkitGetUserMedia(videoObj, function(stream){
            UserVideo.src = window.webkitURL.createObjectURL(stream);
            UserVideo.play();
        }, errBack);
    }
    else if(navigator.mozGetUserMedia) { // Firefox-prefixed
        navigator.mozGetUserMedia(videoObj, function(stream){
            UserVideo.src = window.URL.createObjectURL(stream);
            UserVideo.play();
        }, errBack);
    }


    $scope.record = function() {
        window.AudioContext = window.AudioContext || window.webkitAudioContext || window.mozAudioContext;
        window.URL = window.URL || window.webkitURL;
        navigator.getUserMedia = navigator.getUserMedia ||
            navigator.webkitGetUserMedia ||
            navigator.mozGetUserMedia ||
            navigator.msGetUserMedia;

        var context = new AudioContext()

        navigator.getUserMedia({video: true, audio: true}, function(stream){
            var video = document.querySelector('video-2');
            var liveSource = context.createMediaStreamSource(stream);
            console.log(liveSource);
            var recorder = new Recorder(liveSource, '/bower_components/Recorderjs/recorderWorker.js');
            video.src = window.URL.createObjectURL(stream);
            video.play();

            // webcamstream = stream;
            // streamrecorder = webcamstream.record();
            recorder.record();
        });
        var recorder = new Recorder();
        $scope.recordInProgress = true;
    }

    $scope.stopRecord = function() {
        recorder.stop();
        recorder.getBuffer(createBuffer);
        $scope.recordInProgress = false;
    };

    var createBuffer = function () {

    };
});