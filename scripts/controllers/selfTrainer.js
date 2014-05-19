var SelfTrainerCtrl = LanguageApp.controller('SelfTrainerCtrl', function ($rootScope, $scope) {
    $scope.positive = 0;
    $scope.negative = 0;
    $scope.positeCount = 0;
    $scope.negativeCount = 0;
    $scope.isDone = false;
    $scope.isWrong = false;
    $scope.showNext = false;
    $scope.step = 1;

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
        $scope.currentTrack = $scope.currentTrack < $scope.data.length ? $scope.currentTrack : $scope.data.length - 1;
        $rootScope.$broadcast('audio.set',
                '/audio/' + $scope.data[$scope.currentTrack].file,
            $scope.data[$scope.currentTrack],
            $scope.currentTrack, $scope.data.length);
    };

    $scope.play = function() {
        $rootScope.$broadcast('startPlay');
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
            $scope.isWrong = false;
            $scope.isDisabled = false;
            $scope.questionData = $scope.data[number];
        });
    });

    $scope.doAnswer = function(index) {
        $scope.isDisabled = true;
        $scope.showNext = true;

        if ($scope.questionData.answer == index) {
            $scope.positeCount++;
            $scope.isWrong = false;
        } else {
            $scope.negativeCount++;
            $scope.isWrong = true;
        }

        var count = ($scope.positeCount + $scope.negativeCount < $scope.data.length)
            ? $scope.data.length
            : $scope.positeCount + $scope.negativeCount;
        $scope.positive = ($scope.positeCount/(count)) * 100;
        $scope.negative = ($scope.negativeCount/(count)) * 100;
    };

    $scope.nextItem = function() {
        $scope.questionData = {};
        $scope.step++;

        if($scope.step > $scope.data.length) {
            $scope.isDone = true;
            return;
        }

        $rootScope.$broadcast('audio.next');
    }

    $scope.repeat = function() {
        $scope.questionData = {};
        $scope.isWrong = false;
        $rootScope.$broadcast('audio.prev');
    }

    setTimeout(function () {
        updateTrack();
    }, 200)

});