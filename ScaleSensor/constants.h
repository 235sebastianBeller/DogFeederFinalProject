#ifndef CONSTANTS_H
#define CONSTANTS_H
#define UPDATE_TOPIC "$aws/things/dogFeeder/shadow/update"
const int MQTT_BROKER_PORT = 8883;
const int TRANSMISSION_SPEED=115200;
const byte SAMPLE_SIZE=50;
const int LIMIT_DELAY=1000;
const int STAND_BY_DELAY=200;
const double CALIBRATION_CONST=349.0;
const byte DATA_PIN=2;
const byte SCK_PIN=18;
#endif 