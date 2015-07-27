angular.module('app')
  .controller('HomeCtrl', function ($scope, $location) {

  })

  .controller("NavbarCtrl", function ($rootScope, $scope, $location, $modal, $auth) {
    //TODO: replace loggedIn with function based on currentUser
    $scope.user = $rootScope.user;
    $scope.loggedIn = $rootScope.loggedIn;

    $scope.isActive = function (viewLocation) {
      return viewLocation === $location.path();
    };

    //TODO: refactor to SignupBtnCtrl, but $scope.signup is not passed when i do this
    $scope.signup = {username: '', email: '', password: '', passwordConfirmation: ''};
    $scope.signupAlerts = [];

    $rootScope.$on('navbar:openLoginModal', function(ev) {
      $scope.openLoginModal();
    });

    $scope.openSignupModal = function () {
      var modalInstance = $modal.open({
        templateUrl: 'modals/signup-modal.html',
        controller: 'SignupModalCtrl',
        resolve: {
          signup: function () {
            return $scope.signup;
          }
        }
      });

      modalInstance.result.then(function (signup) {
        $scope.signupAlerts = [];
        $auth.submitRegistration({
          email: signup.email,
          username: signup.username,
          password: signup.password,
          password_confirmation: signup.passwordConfirmation
        })
          .then(function (res) {
            $scope.signupAlerts = [];
          })
          .catch(function (res) {
            if (res.status == 401 || res.status == 403) {
              $scope.signupAlerts = function () {
                if (Array.isArray(res.data.errors)) {
                  return _.map(res.data.errors, function (msg) {
                    return {type: "error", msg: msg};
                  });
                } else {
                  _.flatten(
                    _.map(res.data.errors, function (v, k) {
                      return _.map(v, function (msg) {
                        return {type: "error", msg: k + " " + msg};
                      });
                    }));
                }
              }();
            }
            $scope.openSignupModal();
          });
      }, function (message) {
        //TODO: cancel function
      });
    };

    $scope.creds = {email: '', password: '', remember_me: false};
    $scope.loginAlerts = [];
    $scope.openLoginModal = function () {
      var modalInstance = $modal.open({
        templateUrl: 'modals/login-modal.html',
        controller: 'LoginModalCtrl',
        resolve: {
          creds: function () {
            return $scope.creds;
          }
        }
      });

      modalInstance.result.then(function (creds) {
        $scope.loginAlerts = [];
        $auth.submitLogin(creds)
          .then(function (res) {
            $scope.loginAlerts = [];
            console.log(res);
          })
          .catch(function (res) {
            console.log(res);
            $scope.loginAlerts = _.map(res.errors, function (e) {
              return {type: 'error', msg: e};
            });
            $scope.openLoginModal();
          });
      });
    };
  })

  .controller("SignupModalCtrl", function ($scope, $modalInstance, $auth, signup) {
    $scope.ok = function () {
      $modalInstance.close(signup);
    };

    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };

    $scope.authWith = function (provider) {
      $auth.authenticate(provider)
        .then(function (res) {
          $modalInstance.dismiss('cancel');
        })
        .catch(function (res) {
          console.log(res);
        });
    };
  })

  .controller("LoginModalCtrl", function ($scope, $modalInstance, $auth, creds) {
    $scope.ok = function () {
      $modalInstance.close(creds);
    };

    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };

    $scope.authWith = function (provider) {
      $auth.authenticate(provider)
        .then(function (res) {
          $modalInstance.dismiss('cancel');
        })
        .catch(function (res) {
          console.log(res);
        });
    };
  })

  //TODO: One-Time Microphone Service
  //TODO: SpectroUI state machine factory?

  .controller("SpectroCtrl", function ($scope, $q, artist, audio, mic, SpectralOpts, SpectrogramAnimations, SpectrogramSimilarity) {
    $scope.artist = artist;

    var canvas = document.getElementById('spectrogram-canvas'),
      draw = canvas.getContext('2d'),
      audioTag = document.getElementById('spectrogram-audio');

    var freqRange = SpectralOpts.FREQ_RANGE;
    var decRange = SpectralOpts.DEC_RANGE;
    var audioContext = new window.AudioContext();
    var sx, sy;
    var specSim = SpectrogramSimilarity;

    // need these on scope, so i can switch to factory later,
    //   but still share values to sub-controllers

    audio.audio = audioTag;
    audio.initAudioGraph(audioContext);

    setTimeout(function() {
      //in Chrome v43 only, i'm getting a MEDIA_DEVICE_FAILED_DUE_TO_SHUTDOWN
      // thrown when rendering after user clicks pushstate link
      // ideally, this getUserMedia request should only be executed once per visit.

      mic.initMic(audioContext, function (stream) {
        var defer = $q.defer();
        defer.promise
          .then(function () {
            mic.initMicGraph(stream);
          }).then(function () {
            animate();
          });

        defer.resolve();
      });
    }, 250);

    var countdownStart;
    var recordStarttime, recordEndtime;
    $scope.state = 'initCanvas';
    var states = {
      initCanvas: {
        runOnce: true,
        renderOnce: true,
        ran: false,
        rendered: false,
        run: function () {
          //set canvas dimensions
          sx = canvas.width = canvas.offsetWidth;
          sy = canvas.height = canvas.offsetHeight;
        },
        render: function (results) {
          draw.clearRect(0, 0, sx, sy);
          $scope.state = 'loaded';
        }
      },
      loaded: {
        runOnce: false,
        ran: false,
        renderOnce: false,
        rendered: false,
        run: function () { },
        render: function (results) {
          var waveData = new Uint8Array(mic.analyzer.frequencyBinCount);
          mic.analyzer.getByteTimeDomainData(waveData);
          draw.clearRect(0, 0, sx, sy);
          drawWaveform(waveData);
        }
      },
      playing: {
        runOnce: true,
        ran: false,
        renderOnce: false,
        rendered: false,
        run: function () {
          audio.setupSpectrogram();
          audio.connectSourceToGraph(audio.context.createBufferSource());
          audio.isPlaying = true;
          audio.source.start();
        },
        render: function (results) {
          var waveData = new Uint8Array(audio.analyzer.frequencyBinCount);
          audio.analyzer.getByteTimeDomainData(waveData);
          if (audio.spectrogramLoaded) { $scope.state = 'played'; }
          draw.clearRect(0, 0, sx, sy);
          drawWaveform(waveData);
        }
      },
      played: {
        runOnce: true,
        ran: false,
        renderOnce: true,
        rendered: false,
        run: function () {
          initD3();
          //var min = d3.min(audio.data, function(d) { return d3.min(d.values); });
          var max = d3.max(audio.data, function(d) { return d3.max(d.values); });
          zScale.domain([SpectralOpts.DEC_RANGE[0], max - 10]);
        },
        render: function (results) {
          draw.clearRect(0, 0, sx, sy);
          drawSpectrogram(audio.data);
          audio.image = draw.getImageData(0,0,sx,sy);
        }
      },
      countdown: {
        runOnce: true,
        ran: false,
        renderOnce: false,
        rendered: false,
        run: function () {
          countdownStart = new Date().getTime();
          draw.font = 'italic 72px Arial';
          draw.textAlign = 'center';
          draw.textBaseline = 'middle';
          draw.fillStyle = 'black';
          mic.resetRecording(audio.duration);
        },
        render: function () {
          var msElapsed = ((new Date()).getTime() - countdownStart),
            secondsRemaining = (3 - Math.floor(msElapsed / 1000));
          draw.clearRect(0, 0, sx, sy);
          draw.putImageData(audio.image, 0,0);
          draw.fillText(secondsRemaining.toString(), sx/2, sy/2);
          draw.fillRect(0,0,(msElapsed/3000)*sx, 16);
          draw.fillRect(sx-(msElapsed/3000)*sx,sy-16,(msElapsed/3000)*sx, 16);
          if (msElapsed > 3000) {
            $scope.state = 'recording';
          }
        }
      },
      recording: {
        runOnce: true,
        ran: false,
        renderOnce: false,
        rendered: false,
        run: function () {
          mic.isRecording = true;
          recordStarttime = new Date().getTime();
          recordEndtime = recordStarttime + (audio.duration * 1000);
        },
        render: function () {
          var waveData = new Uint8Array(mic.analyzer.frequencyBinCount);
          var timeNow = (new Date()).getTime(),
            msElapsed = timeNow - recordStarttime;
          mic.analyzer.getByteTimeDomainData(waveData);
          draw.clearRect(0, 0, sx, sy);
          draw.putImageData(audio.image,0,0);
          drawPositionBar(sx * (msElapsed/audio.duration) / 1000);
          drawWaveform(waveData);
          if (timeNow > recordEndtime) {
            $scope.state = 'recorded';
          }
        }
      },
      recorded: {
        runOnce: true,
        ran: false,
        renderOnce: true,
        rendered: false,
        run: function () {
          //initD3();
          //var min = d3.min(audio.data, function(d) { return d3.min(d.values); });
          //var max = d3.max(audio.data, function(d) { return d3.max(d.values); });
          //zScale.domain([SpectralOpts.DEC_RANGE[0], max - 10]);
        },
        render: function () {
          draw.clearRect(0, 0, sx, sy);
          drawSpectrogram(mic.data);
          mic.image = draw.getImageData(0,0,sx,sy);
        }
        //display both sound samples
        // allow for drag and
      },
      scoring: {
        runOnce: true,
        ran: false,
        renderOnce: true,
        rendered: false,
        run: function () {
          var newImg = draw.getImageData(0,0,sx,sy);
          specSim.diffImages(audio.image, mic.image, newImg, 0); // drag'n'drop /w $scope.scoreXOffset
          return {newImg:newImg};
        },
        render: function (results) {
          draw.clearRect(0, 0, sx, sy);
          draw.putImageData(results.newImg, 0,0);
          $scope.state = 'scored';
        }
      },
      scored: {
        runOnce: true,
        ran: false,
        renderOnce: true,
        rendered: false,
        run: function () {
          $scope.sampleScore = specSim.score(audio.image, mic.image, 0) * 100;
        },
        render: function () {

        }
      },
      submitting: {
        runOnce: true,
        ran: false,
        renderOnce: true,
        rendered: false,
        run: function () {

        },
        render: function () {

        }
      },
      submitted: {}
    };

    var animate = function () {
      //TODO: bad idea to use defer in animate block?
      var defer = $q.defer();
      defer.promise
        .then(function () {
          if (!(states[$scope.state].runOnce && states[$scope.state].ran)) {
            states[$scope.state].ran = true; //TODO: make this happen after run() - drawing spectrogram is too slow
            var result = states[$scope.state].run();
            return result;
          }
        })
        .then(function (result) {
          if (!(states[$scope.state].renderOnce && states[$scope.state].rendered)) {
            states[$scope.state].rendered = true; //TODO: make this happen after render()
            states[$scope.state].render(result);
          }
        })
      .then(function (result) {
        requestAnimationFrame(animate);
      });
      defer.resolve();
    };

    var drawWaveform = function (data) {
      SpectrogramAnimations.drawWaveform(draw, sx, sy, data);
    };

    var drawPositionBar = function (x) {
      SpectrogramAnimations.drawPositionBar(draw, x, sy);
    };

    var drawSpectrogram = function (data) {
      SpectrogramAnimations.drawSpectrogram(draw, sx, sy, xScale, yScale, zScale, audio.maxCount, audio.analyzer.frequencyBinCount, audio.nyquist, data);
    };

    $scope.$watch(
      function (scope) {
        return scope.state;
      },
      function (newVal,oldVal) {
        $scope.playEnabled = (newVal == 'loaded' || newVal == 'played' || newVal == 'recorded' || newVal == 'scored');
        $scope.recordEnabled = (newVal == 'played' || newVal == 'recorded');
        $scope.scoreEnabled = (newVal == 'recorded' || newVal == 'submitted');
        $scope.submitEnabled = false; //(newVal == 'scored');
      });

    var xScale, yScale, zScale;
    var initD3 = function () {
      xScale = d3.scale.linear().domain([0, audio.duration]).range([0, sx]);
      yScale = d3.scale.linear().domain(freqRange).range([0, sy]);
      zScale = d3.scale.linear().domain(decRange).range(["white", "blue"]).interpolate(d3.interpolateLab);
    };

    $scope.reset = function (state) {
      states[state].ran = false;
      states[state].rendered = false;
    };

    $scope.play = function () {
      $scope.reset('playing');
      $scope.reset('played');
      $scope.state = 'playing';
    };

    $scope.record = function () {
      $scope.reset('countdown');
      $scope.reset('recording');
      $scope.reset('recorded');
      $scope.state = 'countdown';
    };

    $scope.score = function () {
      $scope.reset('scoring');
      $scope.reset('scored');
      $scope.state = 'scoring';
      //$scope.$apply(); //TODO: figure out why state transitions aren't working without $scope.$digest
    };

    $scope.submit = function () {
      $scope.state = 'submitting';
    };
  })

  .controller("SpectroSoundsCtrl", function ($scope, sound, audio, mic) {
    //TODO: disable play button until the resolve's sound.get() completes
    if ($scope.state != 'initCanvas') { $scope.state = 'loaded'; }
    audio.loaded = false;

    $scope.reset('playing');
    $scope.reset('played');
    $scope.reset('countdown');
    $scope.reset('recording');
    $scope.reset('recorded');
    $scope.reset('scoring');
    $scope.reset('scored');

    $scope.sound = sound;
    audio.src = sound.audiofile;
    audio.loadAudio();
  });
