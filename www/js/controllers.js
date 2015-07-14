angular.module('starter.controllers', [])

  .controller('AppCtrl', function ($scope, $ionicModal, $state, Auth, $http, $timeout, $ionicLoading, $rootScope) {

    // With the new view caching in Ionic, Controllers are only called
    // when they are recreated or on app start, instead of every page change.
    // To listen for when this page is active (for example, to refresh data),
    // listen for the $ionicView.enter event:
    //$scope.$on('$ionicView.enter', function(e) {
    //});

    // Form data for the login modal
    $scope.loginData = {};
    $scope.errorMessage = false;
    // Perform the login action when the user submits the login form
    $scope.doLogin = function () {

      if (!angular.isDefined($scope.loginData.username) || !angular.isDefined($scope.loginData.password) || $scope.loginData.username.trim() == "" || $scope.loginData.password.trim() == "") {
        alert("Enter both user name and password");
        return;
      }
      $ionicLoading.show({
        template: 'Loading...'
      });
      $http.post('http://www.manojnama.com/login', {
        'username': $scope.loginData.username,
        'password': $scope.loginData.password
      })
        .success(function (response) {
          Auth.setUser({
            username: $scope.loginData.username,
            password: $scope.loginData.password
          });
          $ionicLoading.hide();
          $state.go("app.home");
        }).error(function (err) {
          console.log(err);
          $ionicLoading.hide();
          $scope.errorMessage = true;
          $timeout(function () {
            $scope.errorMessage = false;
          }, 5000);
        });

    };

    $scope.logout = function () {
      Auth.logout();
      $state.go("login");
    };
  })

  .controller('HomeCtrl', function ($scope, $rootScope) {
    if (!$rootScope.selectedDuration)
      $rootScope.selectedDuration = "month";
  })

  .controller('DashboardCtrl', function ($scope, $stateParams, $http, Auth, $ionicLoading, $location, $state, $rootScope, $cordovaDatePicker) {
    var startDate, endDate;

    $scope.$on('$ionicView.enter', function (e) {
      calculateDateRange();
    });


    function generateDate(dateObj) {
      return dateObj.getFullYear() + "-" + (dateObj.getMonth() + 1) + "-" + (dateObj.getDate());
    }

    var today = new Date();
    calculateDateRange();

    $scope.resetDateModel = function () {
      $scope.selectedTime.key = null;
    };
    $scope.showWorkLogs = function () {
      if ($scope.selectedTime.key == 'date') {
        $cordovaDatePicker.show({
          date: new Date(),
          mode: 'date', // or 'time'
          allowOldDates: true,
          allowFutureDates: false,
          doneButtonLabel: 'DONE',
          doneButtonColor: '#F2F3F4',
          cancelButtonLabel: 'CANCEL',
          cancelButtonColor: '#000000'
        }).then(function (date) {
          $state.transitionTo("app.dashboard", {
            duration: 'date',
            date: generateDate(date),
            'projectId': $stateParams.projectId
          });
        });
      }
      else {
        $rootScope.selectedDuration = $scope.selectedTime.key;
        $state.transitionTo("app.dashboard", {
          duration: $scope.selectedTime.key,
          'projectId': $stateParams.projectId
        });
      }
    };

    function getMonday(d) {
      d = new Date(d);
      var day = d.getDay(),
        diff = d.getDate() - day + (day == 0 ? -6 : 1); // adjust when day is sunday
      return new Date(d.setDate(diff));
    }

    function calculateDateRange() {
      $scope.currentSelectedDate = null;
      $rootScope.selectedDuration = $stateParams.duration || "month";
      $scope.selectedTime = {
        "key": $stateParams.duration || ""
      };
      switch ($stateParams.duration) {
        case 'day' :
          startDate = endDate = generateDate(today);
          break;
        case 'date' :
          startDate = endDate = $stateParams.date;
          $scope.currentSelectedDate = new Date($stateParams.date);
          break;
        case 'week' :
          console.log("Week");
          startDate = generateDate(new Date(+getMonday(today)));
          endDate = generateDate(new Date());
          break;
        case 'month' :
          console.log("Month");
          var y = today.getFullYear(), m = today.getMonth();
          var firstDayOfMonth = new Date(y, m, 1);
          firstDayOfMonth.setDate(1);
          startDate = firstDayOfMonth;
          startDate = generateDate(startDate);
          endDate = generateDate(new Date());
          break;
        default :
          startDate = endDate = generateDate(today);
      }
      if ($stateParams.projectId == 10800)
        $scope.projectName = "Kokaihop.se";
      else
        $scope.projectName = "Mat.se";

      var user = Auth.getUser();

      $ionicLoading.show({
        template: 'Loading...'
      });

      $http.post('http://www.manojnama.com/info/timesheet', {
        'username': user.username,
        'password': user.password,
        'startDate': startDate,
        'endDate': endDate,
        'projectId': $stateParams.projectId
      })
        .success(function (response) {
          console.log(response);
          $ionicLoading.hide();
          $scope.dataList = response;

        }).error(function (err) {
          $ionicLoading.hide();
          console.log(err);
        });
    }
  });
