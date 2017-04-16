# ruuvitag-mailbox (WORK IN PROGRESS)

This is a small project to mount a Ruuvitag inside a mailbox and make it register movement, have a RaspberryPi (or other host) periodically check the Ruuvitag for movement, and send out a notification, so you know to check your mailbox when you get home.

## Missing

- Build the alerter component
- Photos of the physical installation???
- Make the NRF services use integers instead of strings
- Improve power consumption (NRF.setLowPowerConnection, NRF.setTxPower, advertising interval) ???
- Prevent outsiders from modifying the Ruuvitag [link](http://www.espruino.com/Puck.js+Security)
