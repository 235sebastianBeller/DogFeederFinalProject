#ifndef CONSTANTS_H
#define CONSTANTS_H
#define UPDATE_TOPIC "$aws/things/dogFeeder/shadow/update"
#define GET_DATA_DOG_FEEDER_TOPIC "prueba/dogFeeder/out"
#define UPDATE_DELTA_TOPIC "$aws/things/dogFeeder/shadow/update/delta"
#define GET_TOPIC "$aws/things/dogFeeder/shadow/get"
#include <ArduinoJson.h>

const int MQTT_BROKER_PORT = 8883;
const int TRANSMISSION_SPEED = 115200;
const byte SAMPLE_SIZE = 10;
const int LIMIT_DELAY = 1000;
const int STAND_BY_DELAY = 200;
const long utcOffsetInSeconds = -14400;
const size_t CAPACITY = JSON_ARRAY_SIZE(6);
const size_t SIZE_OUTPUT = JSON_OBJECT_SIZE(4);
const size_t SIZE_INPUT = JSON_OBJECT_SIZE(64);
const String topics[] = {GET_DATA_DOG_FEEDER_TOPIC, GET_TOPIC, UPDATE_TOPIC, UPDATE_DELTA_TOPIC};
const int COUNT_TOPICS = 4;
const byte SIGNAL_PIN = 2;

#endif