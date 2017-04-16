/*
** Configuration
*/
var distance_alert = 50;
var moving_timeout = 2000;

/*
** Basic movement detection
*/
var last_accel;
function detectMovement() {
  //console.log(Ruuvitag.getEnvData());
  var accel = Ruuvitag.getAccelData();

  if(last_accel && accel) {
    var distance = Math.round(
      Math.abs(last_accel.x - accel.x) +
      Math.abs(last_accel.y - accel.y) +
      Math.abs(last_accel.z - accel.z)
      );
    
    if(distance > distance_alert) {
      //console.log("Detected movement: "+distance);
      startedMoving(distance);
    }
  }
  
  last_accel = accel;
}

/*
** Handle movement
*/
var moving;
var moving_started = 0;
var moving_ended = 0;
var moving_max_distance = 0;
function startedMoving(distance) {
  LED2.write(0);
  moving_max_distance = Math.max(moving_max_distance, distance);

  if(moving) {
    clearTimeout(moving);
    moving = undefined;
  } else {
    moving_started = getTime();
    console.log("Movement started: "+moving_started);
  }

  moving = setTimeout(notMovingAnymore, moving_timeout);
}
function notMovingAnymore() {
  if(moving) {
    moving_ended = getTime();
    console.log("Movement ended: "+moving_ended);
    
    NRF.updateServices({
      '4b860000-ba9d-4d33-8a0d-61d9604178f6': {
        '45d8f978-d2c6-4d54-9a4c-4edef7a69159': {
          value: Math.round(moving_ended).toString()
        },
        '13505250-9e27-4aa1-a726-2113bb97b40e': {
          value: Math.round(moving_ended-moving_started).toString()
        },
        '302607a4-33e9-4633-8042-9a335e5ee4b3': {
          value: moving_max_distance.toString()
        },
        '2a8f9414-f6a9-4b5e-af12-cc412ed7100e': {
          value: distance_alert.toString()
        }
      }
    });
  }

  LED2.write(1);
  moving = undefined;
  moving_started = 0;
  moving_ended = 0;
  moving_max_distance = 0;
}

/*
** Setup bluetooth
*/
NRF.setServices({
  '4b860000-ba9d-4d33-8a0d-61d9604178f6': {
    '45d8f978-d2c6-4d54-9a4c-4edef7a69159': {
      value: Math.round(0.0).toString(),
      maxLen: 10,
      readable: true
    },
    '13505250-9e27-4aa1-a726-2113bb97b40e': {
      value: '0',
      maxLen: 10,
      readable: true
    },
    '302607a4-33e9-4633-8042-9a335e5ee4b3': {
      value: '0',
      maxLen: 10,
      readable: true
    },
    '2a8f9414-f6a9-4b5e-af12-cc412ed7100e': {
      value: distance_alert.toString(),
      maxLen: 10,
      readable: true,
      writable: true,
      onWrite: function(evt) {
        distance_alert = parseInt(String.fromCharCode.apply(String, evt.data), 10);
      }
    }
  }
});
NRF.setAdvertising(undefined,
    {interval:1000,
    name: "Mailbox " + NRF.getAddress().split(":").slice(4,6).join(' '),
    showName: true});
//NRF.setLowPowerConnection(true);
NRF.setTxPower(4);

/*
** Start Ruuvitag readings
*/
var Ruuvitag = require("Ruuvitag");
Ruuvitag.setEnvOn(false);

// Due to a bug in LIS2DH12 the callback on setAccelOn isn't working.
// So manually setting up interval to match the freq in LIS2DH12.
Ruuvitag.setAccelOn(true);
setInterval(detectMovement, 1000);
