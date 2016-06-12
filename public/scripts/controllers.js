'use strict';

angular.module('getItDoneApp')

.controller('MenuController', ['$scope', 'menuFactory', 'favoriteFactory', function ($scope, menuFactory, favoriteFactory) {

    $scope.tab = 1;
    $scope.filtText = '';
    $scope.showDetails = false;
    $scope.showFavorites = false;
    $scope.showMenu = false;
    $scope.message = "Loading ...";

    menuFactory.query(
        function (response) {
            $scope.dishes = response;
            $scope.showMenu = true;

        },
        function (response) {
            $scope.message = "Error: " + response.status + " " + response.statusText;
        });

    $scope.select = function (setTab) {
        $scope.tab = setTab;

        if (setTab === 2) {
            $scope.filtText = "appetizer";
        } else if (setTab === 3) {
            $scope.filtText = "mains";
        } else if (setTab === 4) {
            $scope.filtText = "dessert";
        } else {
            $scope.filtText = "";
        }
    };

    $scope.isSelected = function (checkTab) {
        return ($scope.tab === checkTab);
    };

    $scope.toggleDetails = function () {
        $scope.showDetails = !$scope.showDetails;
    };

    $scope.toggleFavorites = function () {
        $scope.showFavorites = !$scope.showFavorites;
    };
    
    $scope.addToFavorites = function(dishid) {
        console.log('Add to favorites', dishid);
        favoriteFactory.save({_id: dishid});
        $scope.showFavorites = !$scope.showFavorites;
    };
}])

.controller('ContactController', ['$scope', 'feedbackFactory', function ($scope, feedbackFactory) {

    $scope.feedback = {
        mychannel: "",
        firstName: "",
        lastName: "",
        agree: false,
        email: ""
    };

    var channels = [{
        value: "tel",
        label: "Tel."
    }, {
        value: "Email",
        label: "Email"
    }];

    $scope.channels = channels;
    $scope.invalidChannelSelection = false;

    $scope.sendFeedback = function () {
        if ($scope.feedback.agree && ($scope.feedback.mychannel === "")) {
            $scope.invalidChannelSelection = true;
        } else {
            $scope.invalidChannelSelection = false;
            feedbackFactory.save($scope.feedback);
            $scope.feedback = {
                mychannel: "",
                firstName: "",
                lastName: "",
                agree: false,
                email: ""
            };
            $scope.feedback.mychannel = "";
            $scope.feedbackForm.$setPristine();
        }
    };
}])

.controller('DishDetailController', ['$scope', '$state', '$stateParams', 'menuFactory', 'commentFactory', function ($scope, $state, $stateParams, menuFactory, commentFactory) {

    $scope.dish = {};
    $scope.showDish = false;
    $scope.message = "Loading ...";

    $scope.dish = menuFactory.get({
            id: $stateParams.id
        })
        .$promise.then(
            function (response) {
                $scope.dish = response;
                $scope.showDish = true;
            },
            function (response) {
                $scope.message = "Error: " + response.status + " " + response.statusText;
            }
        );

    $scope.mycomment = {
        rating: 5,
        comment: ""
    };

    $scope.submitComment = function () {

        commentFactory.save({id: $stateParams.id}, $scope.mycomment);

        $state.go($state.current, {}, {reload: true});
        
        $scope.commentForm.$setPristine();

        $scope.mycomment = {
            rating: 5,
            comment: ""
        };
    };
}])

// implement the IndexController and About Controller here
.controller('GoalController',['$scope','ngDialog','goalsFactory','$rootScope',function($scope,ngDialog,goalsFactory,$rootScope){
    $scope.goalData = {
        description:"",
        dueDate:new Date()
    };
    $scope.invalidDueDate = false;

    $scope.saveGoal = function(){
        var due = new Date($scope.goalData.dueDate);
        var hoy = new Date();
        if(hoy > due){
            $scope.invalidDueDate = true;
        } else {
            goalsFactory.save($scope.goalData).$promise.then(
                function(){
                    $rootScope.$broadcast('updateGoals');
                    ngDialog.close();
                },
                function (response) {
                    var descriptionErrores = '';
                    
                    if(!!response.data.error.errores){
                        var errores = Object.keys(response.data.error.errors);
                        errores.forEach(function(err){
                            descriptionErrores =  response.data.error.errors[err].message;
                        });
                    }

                    var message = ''+
                    '<div class="ngdialog-message">'+
                    '<div><h3>Error '+response.status+' </h3></div>' +
                      '<div><p>' +  response.data.message + '</p><p>' +descriptionErrores+
                      '</p></div>'+
                    '<div class="ngdialog-buttons">'+
                        '<button type="button" class="ngdialog-button ngdialog-button-primary" ng-click=confirm("OK")>OK</button>'+
                    '</div>';
                    ngDialog.openConfirm({ template: message, plain: 'true'});
                }
            );
        }
    };
}])
.controller('TaskController',['$scope','$rootScope','taskFactory','AuthFactory','ngDialog',function($scope,$rootScope,taskFactory,AuthFactory,ngDialog){
    $scope.taskData = {
        description:"",
        startDate:new Date(),
        daysWeek:null,
        pomodorosPerDay:null
    };

    $scope.saveTask = function(){
        $scope.invalidStartDate = false;
        $scope.invalidDaysWeek = false;

        var due = new Date($scope.taskData.startDate);
        var hoy = new Date();
        if(hoy > due){
            $scope.invalidStartDate = true;
        } else if(!$scope.taskData.daysWeek){
            $scope.invalidDaysWeek = true;
        } else{
            var keys = Object.keys($scope.taskData.daysWeek);
            var tmpValues = [];

            keys.forEach(function(key){
                if ($scope.taskData.daysWeek[key]){
                    tmpValues.push(key);
                }
            });

            $scope.taskData.daysWeek = tmpValues;


            taskFactory.save({idGoal:$scope.goal._id,idTask:0},$scope.taskData).$promise.then(
                function(){
                        $rootScope.$broadcast('updateGoals');
                        ngDialog.close();
                    },
                function (response) {
                    var descriptionErrores = '';
                    if(!!response.data.error.errores){
                        var errores = Object.keys(response.data.error.errors);
                        errores.forEach(function(err){
                            descriptionErrores =  response.data.error.errors[err].message;
                        });
                    }
                    var message = ''+
                    '<div class="ngdialog-message">'+
                    '<div><h3>Error '+response.status+' </h3></div>' +
                    '<div><p>'+response.data.message+'</p><p>'+descriptionErrores+
                    '</p></div>'+
                    '<div class="ngdialog-buttons">'+
                    '<button type="button" class="ngdialog-button ngdialog-button-primary" ng-click=confirm("OK")>OK</button>'+
                    '</div>';
                    ngDialog.openConfirm({ template: message, plain: 'true'});
                }
            );
        }
    };
}])
.controller('HomeController', ['$scope','$rootScope','ngDialog','goalsFactory','taskFactory','AuthFactory',function ($scope,$rootScope,ngDialog,goalsFactory,taskFactory,AuthFactory) {

    $scope.deleteOption = false;


    $scope.openAddGoal = function () {
        ngDialog.open({ template: 'views/addGoal.html', scope: $scope, className: 'ngdialog-theme-default', controller:"GoalController" });
    };
    $scope.openAddTask = function (goal) {
        $rootScope.goal = goal;
        ngDialog.open({ template: 'views/addTask.html', scope: $scope, className: 'ngdialog-theme-default', controller:"TaskController" });
    };

    $scope.showDeleteButtons = function(){
        $scope.deleteOption = !$scope.deleteOption;
    };

    $scope.deleteGoal = function(idGoal){
        $scope.deleteOption = false;
        goalsFactory.delete({goalId:idGoal},
            function(){
                $rootScope.$broadcast('updateGoals');
            },function(){
                console.log('Error');
            }
        );
    };

    $scope.deleteTask = function(idGoal,idTask){
        $scope.deleteOption = false;
        taskFactory.delete({idGoal:idGoal,idTask:idTask},
            function(){
                $rootScope.$broadcast('updateGoals');
            },function(){
                console.log('Error');
            }
        );
    };

    //$rootScope.$broadcast('updateGoals', 'message');
    //$rootScope.$broadcast('updateGoals');

    


    if (AuthFactory.isAuthenticated) {
        $rootScope.username = AuthFactory.getUsername();
        $rootScope.$broadcast('updateGoals');
    }
    
}])

.controller('AboutController', ['$scope', 'corporateFactory', function ($scope, corporateFactory) {

    $scope.leaders = corporateFactory.query();

}])

.controller('FavoriteController', ['$scope', '$state', 'favoriteFactory', function ($scope, $state, favoriteFactory) {

    $scope.tab = 1;
    $scope.filtText = '';
    $scope.showDetails = false;
    $scope.showDelete = false;
    $scope.showMenu = false;
    $scope.message = "Loading ...";

    favoriteFactory.query(
        function (response) {
            $scope.dishes = response.dishes;
            $scope.showMenu = true;
        },
        function (response) {
            $scope.message = "Error: " + response.status + " " + response.statusText;
        });

    $scope.select = function (setTab) {
        $scope.tab = setTab;

        if (setTab === 2) {
            $scope.filtText = "appetizer";
        } else if (setTab === 3) {
            $scope.filtText = "mains";
        } else if (setTab === 4) {
            $scope.filtText = "dessert";
        } else {
            $scope.filtText = "";
        }
    };

    $scope.isSelected = function (checkTab) {
        return ($scope.tab === checkTab);
    };

    $scope.toggleDetails = function () {
        $scope.showDetails = !$scope.showDetails;
    };

    $scope.toggleDelete = function () {
        $scope.showDelete = !$scope.showDelete;
    };
    
    $scope.deleteFavorite = function(dishid) {
        console.log('Delete favorites', dishid);
        favoriteFactory.delete({id: dishid});
        $scope.showDelete = !$scope.showDelete;
        $state.go($state.current, {}, {reload: true});
    };
}])

.controller('HeaderController', ['$scope', '$state', '$rootScope', 'ngDialog', 'AuthFactory','goalsFactory',function ($scope, $state, $rootScope, ngDialog, AuthFactory,goalsFactory) {

    var updateGoals = function(fun){
        goalsFactory.query({}).$promise.then(
            function (response) {
                response = response.map(function(val){
                    val.dueDate = moment(val.dueDate).format("dddd, MMM DD, YYYY");
                    val.tasks = val.tasks.map(function(task){
                        task.startDate = moment(task.startDate).format("dddd, MMM DD, YYYY");
                        task.daysWeek = task.daysWeek.join(", ");
                        task.value = task.description;
                        task.hoursWorded = Math.round(task.workedPomodoros.length * (25/60) * 100)/100;
                        return task;
                    });
                    return val;
                });
                $rootScope.goals = response.map(function(cv){
                    cv.value = cv.description;
                    return cv;
                });
                if(!!fun){
                    fun();
                }
                //$scope.goals = $rootScope.goals;
            },
            function (response) {
                $scope.message = "Error: " + response.status + " " + response.statusText;
            }
        );
    };

    $scope.$on('updateGoals', function (event,fun) { 
        updateGoals(fun);
    });

    $scope.loggedIn = false;
    $scope.username = '';
    
    if(AuthFactory.isAuthenticated()) {
        $scope.loggedIn = true;
        $scope.username = AuthFactory.getUsername();
        $rootScope.username = AuthFactory.getUsername();
        updateGoals();
    }
        
    $scope.openLogin = function () {
        ngDialog.open({ template: 'views/login.html', scope: $scope, className: 'ngdialog-theme-default', controller:"LoginController" });
    };
    
    $scope.logOut = function() {
       AuthFactory.logout();
        $scope.loggedIn = false;
        $scope.username = '';
        $rootScope.username = "";
        $rootScope.goals = [];
    };
    
    $rootScope.$on('login:Successful', function () {
        $scope.loggedIn = AuthFactory.isAuthenticated();
        $scope.username = AuthFactory.getUsername();
        $rootScope.username = AuthFactory.getUsername();
        $rootScope.$broadcast('updateGoals');
    });
        
    $rootScope.$on('registration:Successful', function () {
        $scope.loggedIn = AuthFactory.isAuthenticated();
        $scope.username = AuthFactory.getUsername();
        $rootScope.username = AuthFactory.getUsername();
    });
    
    $scope.stateis = function(curstate) {
       return $state.is(curstate);  
    };
    
}])

.controller('PomodoroController',['$scope','$rootScope','$interval','pomodorosFactory','ngDialog',function($scope,$rootScope,$interval,pomodorosFactory,ngDialog){

    $scope.formDisabled = false;
    $scope.blockButtons = false;

    $scope.break = {
        timeLabel: /*moment(new Date('2016-06-11T00:05:00.000Z')).format('mm:ss'),*/moment(new Date('2016-06-11T00:00:05.000Z')).format('mm:ss'),
        time: /*moment(new Date('2016-06-11T00:05:00.000Z'))*/moment(new Date('2016-06-11T00:00:05.000Z'))
    };

    $scope.goal = "";
    $scope.task = "";

    $scope.pomodoro = {
        goal:"",
        idTask:"",
        timeLabel: /*moment(new Date('2016-06-11T00:25:00.000Z')).format('mm:ss'),*/moment(new Date('2016-06-11T00:00:25.000Z')).format('mm:ss'),
        time: /*moment(new Date('2016-06-11T00:25:00.000Z'))*/moment(new Date('2016-06-11T00:00:25.000Z'))
    };

    $rootScope.$broadcast('updateGoals',function(){
        $scope.goals = $rootScope.goals;
    });

    $scope.changeGoal = function(){
        $scope.goals.forEach(function(goal){
            if(goal.description === $scope.pomodoro.goal){
                $scope.goal = goal;
                $scope.tasks = goal.tasks;
            }
        });
    };

    $scope.changeTask = function(){
        $scope.goal.tasks.forEach(function(task){
            if(task.description === $scope.pomodoro.idTask){
                $scope.task = task;
            }
        });
    };

    var breakFn = function(){
        var beepCont = 1;
        var beep = $interval(function(){
            snd.play();
            if(beepCont===3){
                $interval.cancel(beep);
            }
            beepCont++;
        },280,3);
    };

    $scope.message = "Time to be focus";

    var snd = new Audio("data:audio/wav;base64,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qJrx4KOQjahZxWbcZgztj2c49nKmkId44S71j0c8eV9yDK6uPRzx5X18eDvjvQ6yKo9ZSS6l//8elePK/Lf//IInrOF/FvDoADYAGBMGb7FtErm5MXMlmPAJQVgWta7Zx2go+8xJ0UiCb8LHHdftWyLJE0QIAIsI+UbXu67dZMjmgDGCGl1H+vpF4NSDckSIkk7Vd+sxEhBQMRU8j/12UIRhzSaUdQ+rQU5kGeFxm+hb1oh6pWWmv3uvmReDl0UnvtapVaIzo1jZbf/pD6ElLqSX+rUmOQNpJFa/r+sa4e/pBlAABoAAAAA3CUgShLdGIxsY7AUABPRrgCABdDuQ5GC7DqPQCgbbJUAoRSUj+NIEig0YfyWUho1VBBBA//uQZB4ABZx5zfMakeAAAAmwAAAAF5F3P0w9GtAAACfAAAAAwLhMDmAYWMgVEG1U0FIGCBgXBXAtfMH10000EEEEEECUBYln03TTTdNBDZopopYvrTTdNa325mImNg3TTPV9q3pmY0xoO6bv3r00y+IDGid/9aaaZTGMuj9mpu9Mpio1dXrr5HERTZSmqU36A3CumzN/9Robv/Xx4v9ijkSRSNLQhAWumap82WRSBUqXStV/YcS+XVLnSS+WLDroqArFkMEsAS+eWmrUzrO0oEmE40RlMZ5+ODIkAyKAGUwZ3mVKmcamcJnMW26MRPgUw6j+LkhyHGVGYjSUUKNpuJUQoOIAyDvEyG8S5yfK6dhZc0Tx1KI/gviKL6qvvFs1+bWtaz58uUNnryq6kt5RzOCkPWlVqVX2a/EEBUdU1KrXLf40GoiiFXK///qpoiDXrOgqDR38JB0bw7SoL+ZB9o1RCkQjQ2CBYZKd/+VJxZRRZlqSkKiws0WFxUyCwsKiMy7hUVFhIaCrNQsKkTIsLivwKKigsj8XYlwt/WKi2N4d//uQRCSAAjURNIHpMZBGYiaQPSYyAAABLAAAAAAAACWAAAAApUF/Mg+0aohSIRobBAsMlO//Kk4soosy1JSFRYWaLC4qZBYWFRGZdwqKiwkNBVmoWFSJkWFxX4FFRQWR+LsS4W/rFRb/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////VEFHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAU291bmRib3kuZGUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMjAwNGh0dHA6Ly93d3cuc291bmRib3kuZGUAAAAAAAAAACU=");  

    var reloj,breakClock;
    var contador = 0;
    $scope.iniciarPomodoro = function(){    
        $scope.formDisabled = true;
        //var tiempo = 1500;
        var tiempo = 25;
        var tiempoBreak = 5;
        reloj = $interval(function(){
            $scope.pomodoro.timeLabel =  moment($scope.pomodoro.time).subtract(++contador,'seconds').format('mm:ss');
            if(contador === tiempo){
                incPomodoro();
                breakFn();
                $interval.cancel(reloj);
                contador = 0;
                // Guardar pomodoro en la base de datos
                $scope.blockButtons = true;
                $scope.message = "Time to take a break! :D";
                console.log('Hora de descansar! :D 5 min');
                $scope.pomodoro.timeLabel =  moment($scope.break.time).subtract(0,'seconds').format('mm:ss');
                breakClock = $interval(function(){
                    $scope.pomodoro.timeLabel =  moment($scope.break.time).subtract(++contador,'seconds').format('mm:ss');
                    if(contador===tiempoBreak){
                        breakFn();
                        $scope.pomodoro.timeLabel =  moment($scope.pomodoro.time).subtract(0,'seconds').format('mm:ss');
                        $scope.blockButtons = false;
                        $scope.formDisabled = false;
                        contador = 0;
                        $scope.message = "Time to be focus";
                        console.log('Ahora a trabajar!');
                    }
                },1000,tiempoBreak);
            }
        }, 1000,tiempo);
    };

    $scope.detenerPomodoro = function(){
        $interval.cancel(reloj);
    };

    $scope.resetPomodoro = function(){
        $scope.formDisabled = false;
        $interval.cancel(reloj);
        $scope.pomodoro.timeLabel =  moment($scope.pomodoro.time).subtract(0,'seconds').format('mm:ss');
        contador = 0;
    };

    var incPomodoro = function(){
        pomodorosFactory.save({idGoal:$scope.goal._id,idTask:$scope.task._id,idPomodoro:0},{}).$promise.then(
            function(){
                    $rootScope.$broadcast('updateGoals');
                },
            function (response) {
                var descriptionErrores = '';
                if(!!response.data.error.errores){
                    var errores = Object.keys(response.data.error.errors);
                    errores.forEach(function(err){
                        descriptionErrores =  response.data.error.errors[err].message;
                    });
                }
                var message = ''+
                '<div class="ngdialog-message">'+
                '<div><h3>Error '+response.status+' </h3></div>' +
                '<div><p>'+response.data.message+'</p><p>'+descriptionErrores+
                '</p></div>'+
                '<div class="ngdialog-buttons">'+
                '<button type="button" class="ngdialog-button ngdialog-button-primary" ng-click=confirm("OK")>OK</button>'+
                '</div>';
                ngDialog.openConfirm({ template: message, plain: 'true'});
            }
        );
    };
    




    /*if (AuthFactory.isAuthenticated) {
        $rootScope.$broadcast('updateGoals');
    }*/
}])

.controller('LoginController', ['$scope', 'ngDialog', '$localStorage', 'AuthFactory', function ($scope, ngDialog, $localStorage, AuthFactory) {
    
    $scope.loginData = $localStorage.getObject('userinfo','{}');
    
    $scope.doLogin = function() {
        if($scope.rememberMe){
            $localStorage.storeObject('userinfo',$scope.loginData);
        }
        AuthFactory.login($scope.loginData);
        ngDialog.close();
    };
            
    $scope.openRegister = function () {
        ngDialog.open({ template: 'views/register.html', scope: $scope, className: 'ngdialog-theme-default', controller:"RegisterController" });
    };  
    
}])

.controller('RegisterController', ['$scope', 'ngDialog', '$localStorage', 'AuthFactory', function ($scope, ngDialog, $localStorage, AuthFactory) {
    
    $scope.register={};
    $scope.loginData={};
    
    $scope.doRegister = function() {
        console.log('Doing registration', $scope.registration);
        AuthFactory.register($scope.registration);
        ngDialog.close();
    };
}])
;