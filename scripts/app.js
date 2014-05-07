window.LanguageApp = angular.module('LanguageApp', [
    'audioPlayer-directive',
    'ngRoute'
]).config(function ($routeProvider) {

    $routeProvider
        .when('/', {
            templateUrl: '../views/selfTrainer.html',
            controller: 'SelfTrainerCtrl',
            controllerAs: 'ctrl'
        })
        .when('/final', {
            templateUrl: '../views/final.html',
            controller: 'FinalTestCtrl',
            controllerAs: 'ctrl'
        })
        .when('/speech_correction', {
            templateUrl: '../views/speech_correction.html',
            controller: 'SpeechCorrectionCtrl',
            controllerAs: 'ctrl'
        })
        .otherwise({
            redirectTo: '/'
        });
});

LanguageApp.filter('startFrom', function () {
    return function (input, start) {
        start = +start; //parse to int
        return input.slice(start);
    };
});