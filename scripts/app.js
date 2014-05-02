var LanguageApp = angular.module('LanguageApp', [
    'audioPlayer-directive'
]);

LanguageApp.filter('startFrom', function () {
    return function (input, start) {
        start = +start; //parse to int
        return input.slice(start);
    };
});

//http://blog.jetboystudio.com/articles/angular-music-player/
var SelfTrainerCtrl = LanguageApp.controller('SelfTrainerCtrl', function ($rootScope, $scope) {
    $scope.positive = 0;
    $scope.negative = 0;
    $scope.isDone = false;
    $scope.isWrong = false;
    $scope.showNext = false;

    $scope.answer = null;
    $scope.questionData = {};
    $scope.currentTrack = 0;
    $scope.pageSize = 5;
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

    var updateTrack = function () {
        $rootScope.$broadcast('audio.set',
                '/audio/' + $scope.data[$scope.currentTrack].file,
            $scope.data[$scope.currentTrack],
            $scope.currentTrack, $scope.data.length);
    };

    $rootScope.$on('audio.next', function () {
        $scope.currentTrack++;
        if ($scope.currentTrack < $scope.data.length) {
            updateTrack();
        } else {
            $scope.currentTrack = $scope.data.length - 1;
        }
    });

    $rootScope.$on('audio.prev', function () {
        $scope.currentTrack--;
        if ($scope.currentTrack >= 0) {
            updateTrack();
        } else {
            $scope.currentTrack = 0;
        }
    });

    $rootScope.$on('audio.ended', function(context, number) {
        $scope.$apply(function() {
            $scope.showNext = false;
            $scope.questionData = $scope.data[number];
        });
    });

    $scope.doAnswer = function(index) {
        $scope.showNext = true;
        if ($scope.questionData.answer == index) {
            $scope.positive += (1/$scope.data.length) * 100;
            $scope.isWrong = false;
        } else {
            $scope.isWrong = true;
            $scope.negative += (1/$scope.data.length) * 100;
            return;
        }

        if(index < $scope.data.length -1) {
        } else {
            $scope.isDone = true;
        }
    };

    $scope.nextItem = function() {
        $scope.questionData = {};
        $rootScope.$broadcast('audio.next');
    }

    $scope.repeat = function() {
        $scope.questionData = {};
        $scope.isWrong = false;
        $rootScope.$broadcast('audio.prev');
    }

    setTimeout(function () {
        updateTrack();
    }, 100)

});