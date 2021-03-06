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

    var streamG = null;

    (function(exports) {

        exports.URL = exports.URL || exports.webkitURL;

        exports.requestAnimationFrame = exports.requestAnimationFrame ||
            exports.webkitRequestAnimationFrame || exports.mozRequestAnimationFrame ||
            exports.msRequestAnimationFrame || exports.oRequestAnimationFrame;

        exports.cancelAnimationFrame = exports.cancelAnimationFrame ||
            exports.webkitCancelAnimationFrame || exports.mozCancelAnimationFrame ||
            exports.msCancelAnimationFrame || exports.oCancelAnimationFrame;

        navigator.getUserMedia = navigator.getUserMedia ||
            navigator.webkitGetUserMedia || navigator.mozGetUserMedia ||
            navigator.msGetUserMedia;

        var ORIGINAL_DOC_TITLE = document.title;
        var video = UserVideo;
        var canvas = document.createElement('canvas'); // offscreen canvas.
        var rafId = null;
        var startTime = null;
        var endTime = null;
        var frames = [];

        function $(selector) {
            return document.querySelector(selector) || null;
        }

        function turnOnCamera(e) {
            video.controls = false;

            var finishVideoSetup_ = function() {
                // Note: video.onloadedmetadata doesn't fire in Chrome when using getUserMedia so
                // we have to use setTimeout. See crbug.com/110938.
                setTimeout(function() {
                    video.width = 320;//video.clientWidth;
                    video.height = 200;// video.clientHeight;
                    // Canvas is 1/2 for performance. Otherwise, getImageData() readback is
                    // awful 100ms+ as 640x480.
                    canvas.width = video.width;
                    canvas.height = video.height;
                }, 1000);
            };

            navigator.getUserMedia({video: true, audio: true}, function(stream) {
                video.src = window.URL.createObjectURL(stream);
                streamG = stream;
                finishVideoSetup_();
            }, function(e) {
                alert('Fine, you get a movie instead of your beautiful face ;)');

                video.src = 'Chrome_ImF.mp4';
                finishVideoSetup_();
            });
        };

        function record(stream) {
            $scope.recordIsDone = false;
            $scope.plaing = false;
            $scope.recordInProgress = true;
            var ctx = canvas.getContext('2d');
            var CANVAS_HEIGHT = canvas.height;
            var CANVAS_WIDTH = canvas.width;

            frames = []; // clear existing frames;
            startTime = Date.now();

            function drawVideoFrame_(time) {
                rafId = requestAnimationFrame(drawVideoFrame_);

                ctx.drawImage(video, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

                document.title = 'Recording...' + Math.round((Date.now() - startTime) / 1000) + 's';

                // Read back canvas as webp.
                var url = canvas.toDataURL('image/webp', 1); // image/jpeg is way faster :(

                frames.push(url);
            };

            rafId = requestAnimationFrame(drawVideoFrame_);
            $scope.connectAudioInToSpeakers(streamG);
        };

        function stop() {
            $scope.recordInProgress = false;
            $scope.recordIsDone = true;
            cancelAnimationFrame(rafId);
            endTime = Date.now();
            document.title = ORIGINAL_DOC_TITLE;
            $scope.makeItStop();
        };

        function embedVideoPreview(opt_url) {
            if(!$scope.recordIsDone) {
                return;
            }
            $scope.plaing = true;
            var url = opt_url || null;
            var video = $('#video-3') || null;

            window.URL.revokeObjectURL(video.src);

            if (!url) {
                var webmBlob = Whammy.fromImageArray(frames, 1000 / 60);
                url = window.URL.createObjectURL(webmBlob);
            }

            video.src = url;
            $scope.playMe();
        }

        function initEvents() {
            turnOnCamera();

            $scope.record = record;
            $scope.stopRecord = stop;
            $scope.playMySelf = embedVideoPreview;
        }

        initEvents();

        exports.$ = $;


        // creates an audiocontext and hooks up the audio input
        $scope.connectAudioInToSpeakers = function (stream) {
            var context = new AudioContext();
//            navigator.getUserMedia({audio: true}, function (stream) {
                console.log('start recordig');
                liveSource = context.createMediaStreamSource(stream);
                recorder = new Recorder(liveSource, {workerPath: '/bower_components/Recorderjs/recorderWorker.js'})
                recorder.clear();
                recorder.record();

//            }, function(e) {});
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
            }
        };

    })(window);
});