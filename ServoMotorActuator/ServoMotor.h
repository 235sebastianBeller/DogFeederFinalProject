#ifndef SERVOMOTOR_H
#define SERVOMOTOR_H
#include "constants.h"
#include <ArduinoJson.h>
#include <Deneyap_Servo.h>
using namespace std;
class ServoMotor
{
private:
  byte signalPin;
  Servo servo; 

public:
  ServoMotor(byte signalPin);
  void stop();
  void start();
  ~ServoMotor();
};
#endif