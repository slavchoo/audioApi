window.AudioContext = window.AudioContext || window.webkitAudioContext;
if (!AudioContext) alert('This site cannot be run in your Browser. Try a recent Chrome or Firefox. ');

var audioContext = new AudioContext();
var currentBuffer = null;

// CANVAS
var canvasWidth = 750, canvasHeight = 120;
var newCanvas = createCanvas(canvasWidth, canvasHeight);
var context = null;

function appendCanvas() {
    $('#wave .canvas').empty().append(newCanvas);
    context = newCanvas.getContext('2d');
}

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
                        currentBuffer = buffer;
                        displayBuffer(buffer);
                    }, onDecodeError);
            else
                alert('error during the load.Wrong url or cross origin issue');
        }
    };
    req.send();
}

function onDecodeError() {
    alert('error while decoding your file.');
}

// MUSIC DISPLAY
function displayBuffer(buff /* is an AudioBuffer */) {
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

function createCanvas(w, h) {
    var newCanvas = document.createElement('canvas');
    newCanvas.width = w;
    newCanvas.height = h;
    return newCanvas;
};

angular.module('audioPlayer-directive', [])
    .directive('audioPlayer', function ($rootScope) {
        return {
            restrict: 'E',
            scope: {},
            controller: function ($scope, $element) {
                $scope.audio = new Audio();
                $scope.currentNum = 0;

                // tell others to give me my prev/next track (with audio.set message)
                $scope.next = function () {
                    $rootScope.$broadcast('audio.next');
                };
                $scope.prev = function () {
                    $rootScope.$broadcast('audio.prev');
                };

                // tell audio element to play/pause, you can also use $scope.audio.play() or $scope.audio.pause();
                $scope.playpause = function () {
                    if ($scope.audio.paused) $scope.audio.play();
                };

                $rootScope.$on('startPlay', $scope.playpause)

                // listen for audio-element events, and broadcast stuff
                $scope.audio.addEventListener('play', function () {
                    $('#wave .progress-line').css({left: 0});
                    appendCanvas();
                    $('#wave .progress-line').animate({left: canvasWidth}, $scope.audio.duration * 1000);

                    $rootScope.$broadcast('audio.play', this);
                });
                $scope.audio.addEventListener('pause', function () {
                    $rootScope.$broadcast('audio.pause', this);
                });
                $scope.audio.addEventListener('timeupdate', function () {
                    $rootScope.$broadcast('audio.time', this);
                }, false);
                $scope.audio.addEventListener('ended', function () {
                    $('#wave .progress-line').css({left: 0});
                    $rootScope.$broadcast('audio.ended', $scope.currentNum);
                    $scope.next();
                });

                // set track & play it
                $rootScope.$on('audio.set', function (r, file, info, currentNum, totalNum) {
                    appendCanvas();
                    loadMusic(file);

                    var playing = !$scope.audio.paused;
                    $scope.audio.src = file;

                    if (playing) {
                        $scope.audio.play();
                    } else {
                        $scope.audio.pause();
                    }

                    $scope.info = info;
                    $scope.currentNum = currentNum;
                    $scope.totalNum = totalNum;

                });
            },

            templateUrl: '/component.html'
        };
    });