LanguageApp.controller('SpeechCorrectionCtrl', function ($rootScope, $scope) {
    var canvasWidth = 750, canvasHeight = 120;
    var userCanvas = createCanvas(canvasWidth, canvasHeight);
    var dictorCanvas = createCanvas(canvasWidth, canvasHeight);
    $('#wave-1 .canvas').empty().append(dictorCanvas);
    $('#wave-2 .canvas').empty().append(userCanvas);
    var userCanvasContext = userCanvas.getContext('2d');
    var dictorCanvasContext = dictorCanvas.getContext('2d');
    var originalAudio = new Audio();
    var userBuffer = {};

    // MUSIC LOADER + DECODE
    function loadMusic(url) {
        var req = new XMLHttpRequest();
        req.open("GET", url, true);
        req.responseType = "arraybuffer";
        req.onreadystatechange = function (e) {
            if (req.readyState == 4) {
                if (req.status == 200)
                    audioContext.decodeAudioData(req.response,
                        function (buffer) {
                            userBuffer = buffer;
                            displayBuffer(buffer, dictorCanvasContext);
                        }, function() {
                            console.log('decode error');
                        });
                else
                    alert('error during the load.Wrong url or cross origin issue');
            }
        };
        req.send();
    }

    // MUSIC DISPLAY
    function displayBuffer(buff, context) {
        var leftChannel = buff.getChannelData(0); // Float32Array describing left channel
        var lineOpacity = canvasWidth / leftChannel.length;
        context.save();
        context.fillStyle = '#222';
        context.fillRect(0, 0, canvasWidth, canvasHeight);
        context.strokeStyle = '#121';
        context.globalCompositeOperation = 'lighter';
        context.translate(0, canvasHeight / 2);
        context.globalAlpha = 0.06; // lineOpacity ;
        for (var i = 0; i < leftChannel.length; i++) {
            // on which line do we get ?
            var x = Math.floor(canvasWidth * i / leftChannel.length);
            var y = leftChannel[i] * canvasHeight / 2;
            context.beginPath();
            context.moveTo(x, 0);
            context.lineTo(x + 1, y);
            context.stroke();
        }
        context.restore();
    };


    $scope.recordInProgress = false;
    var userAudioSource = null;

    window.AudioContext = window.AudioContext || window.webkitAudioContext || window.mozAudioContext;

    $scope.data = [
        {
            title: 'title mp3',
            file: '1.mp3',
            variants: ['Здравствуйте', 'До свидания', 'Я ёжик'],
            answer: 0
        },
        {
            title: 'title 2 mp3',
            file: '2.mp3',
            variants: ['Это утка', 'Нож не режет', 'Я не умею резать'],
            answer: 1
        }
    ];

    loadMusic('/audio/' + $scope.data[0].file);
    $scope.currentTrack = $scope.data[0];
    $scope.currentTrackNum = 0;

    // this is to store a reference to the input so we can kill it later
    var liveSource;

    navigator.getUserMedia = navigator.getUserMedia ||
        navigator.webkitGetUserMedia || navigator.mozGetUserMedia ||
        navigator.msGetUserMedia;

    var recorder = null;
    // creates an audiocontext and hooks up the audio input
    $scope.connectAudioInToSpeakers = function () {
        var context = new AudioContext();
        navigator.getUserMedia({audio: true}, function (stream) {
            console.log('start recordig');
            liveSource = context.createMediaStreamSource(stream);
            recorder = new Recorder(liveSource, {workerPath: '/bower_components/Recorderjs/recorderWorker.js'})
            recorder.clear();
            recorder.record();

            $scope.$apply(function() {
                $scope.recordInProgress = true;
            });

        }, function(e) {});
    };

    // disconnects the audio input
    $scope.makeItStop = function () {
        recorder.stop();
        recorder.getBuffer(createBuffer);
        $scope.recordInProgress = false;
    };

    var etalonBuffers = null;
    var createBuffer = function(buffers) {
        etalonBuffers = buffers;
        var newSource = audioContext.createBufferSource();
        var newBuffer = audioContext.createBuffer( 2, buffers[0].length, audioContext.sampleRate );
        newBuffer.getChannelData(0).set(buffers[0]);
        newBuffer.getChannelData(1).set(buffers[1]);
        newSource.buffer = newBuffer;

        newSource.connect( audioContext.destination );
        userAudioSource = newSource;

        $('#wave-2 .canvas').empty().append(userCanvas);
        displayBuffer(newBuffer, userCanvasContext);
    };

    $scope.playMe = function() {
        var buffers = etalonBuffers;
        var newSource = audioContext.createBufferSource();
        var newBuffer = audioContext.createBuffer( 2, buffers[0].length, audioContext.sampleRate );
        newBuffer.getChannelData(0).set(buffers[0]);
        newBuffer.getChannelData(1).set(buffers[1]);
        newSource.buffer = newBuffer;

        newSource.connect( audioContext.destination );
        userAudioSource = newSource;

        if (userAudioSource) {
            userAudioSource.start(0);
            $('#wave-2 .progress-line').css({left: 0});
            $('#wave-2 .progress-line').animate({left: canvasWidth}, userAudioSource.buffer.duration * 1000);
        }
    };

    $scope.playOriginal = function() {
        originalAudio.src = '/audio/'+$scope.currentTrack.file;
        $('#wave-1 .canvas').empty().append(dictorCanvas);
        originalAudio.play();
    };

    $scope.next = function() {
        var currentIndex = _.indexOf($scope.data, $scope.currentTrack);
        currentIndex++;
        var nextNum = currentIndex > $scope.data.length - 1 ? $scope.data.length - 1 : currentIndex;
        $scope.currentTrack = $scope.data[nextNum];
    };

    $scope.prev = function() {
        var currentIndex = _.indexOf($scope.data, $scope.currentTrack);
        currentIndex--;
        var nextNum = currentIndex < 1 ? 0 : currentIndex;
        $scope.currentTrack = $scope.data[nextNum];
    };

    $scope.$watch('currentTrack', function(track) {
        $('#wave-1 .progress-line').css({left: 0});
        if(!track)
            return;
        userAudioSource = null;
        loadMusic('/audio/' + track.file);
        $('#wave-2 .canvas').empty();
        $('#wave-1 .progress-line').css({left: 0});
    });

    originalAudio.addEventListener('play', function (ev) {
        $('#wave-1 .progress-line').css({left: 0});
        $('#wave-1 .progress-line').animate({left: canvasWidth}, userBuffer.duration * 1000);
    });
});