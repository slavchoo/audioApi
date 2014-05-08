LanguageApp.controller('SpeechCorrectionCtrl', function ($rootScope, $scope) {

    $scope.recordInProgress = false;
    var audio = new Audio();
    var originalAudio = new Audio();

    window.AudioContext = window.AudioContext || window.webkitAudioContext || window.mozAudioContext;
    var createSrc = window.webkitURL ? window.webkitURL.createObjectURL : function(stream) {return stream;};

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
    $scope.currentTrack = $scope.data[0];
    $scope.currentTrackNum = 0;

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
        originalAudio.src = '/audio/'+$scope.currentTrack.file;
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
});