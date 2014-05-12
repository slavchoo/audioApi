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
                finishVideoSetup_();
            }, function(e) {
                alert('Fine, you get a movie instead of your beautiful face ;)');

                video.src = 'Chrome_ImF.mp4';
                finishVideoSetup_();
            });
        };

        function record() {
            $scope.recordInProgress = true;
            var elapsedTime = $('#elasped-time');
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
        };

        function stop() {
            $scope.recordInProgress = false;
            $scope.recordIsDone = true;
            cancelAnimationFrame(rafId);
            endTime = Date.now();
            document.title = ORIGINAL_DOC_TITLE;
        };

        function embedVideoPreview(opt_url) {
            if(!$scope.recordIsDone) {
                return;
            }
            var url = opt_url || null;
            var video = $('#video-2') || null;

            if (!video) {
                video = document.createElement('video');
                video.autoplay = true;
                video.controls = true;
                video.loop = true;
                //video.style.position = 'absolute';
                //video.style.top = '70px';
                //video.style.left = '10px';
                video.style.width = canvas.width + 'px';
                video.style.height = canvas.height + 'px';
                $('#video-preview').appendChild(video);

            } else {
                window.URL.revokeObjectURL(video.src);
            }

            // https://github.com/antimatter15/whammy
            // var encoder = new Whammy.Video(1000/60);
            // frames.forEach(function(dataURL, i) {
            //   encoder.add(dataURL);
            // });
            // var webmBlob = encoder.compile();

            if (!url) {
                var webmBlob = Whammy.fromImageArray(frames, 1000 / 60);
                url = window.URL.createObjectURL(webmBlob);
            }

            video.src = url;
        }

        function initEvents() {
            turnOnCamera();

            $scope.record = record;
            $scope.stopRecord = stop;
            $scope.playMySelf = embedVideoPreview;
        }

        initEvents();

        exports.$ = $;

    })(window);
});