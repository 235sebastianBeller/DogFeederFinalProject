#ifndef ESP32_H
#define ESP32_H
#include "constants.h"
#include "MqttClientController.h"
#include "ServoMotor.h"
#include <ArduinoJson.h>
#include <NTPClient.h>
#include <sstream>
using namespace std;
class Esp32
{
private:
  bool activationCategory;
  bool anyWeigth;
  bool servoShouldBeOn;
  string hours;
  string minutes;

public:
  Esp32();
  bool getActivationCategory();
  bool getAnyWeigth();
  bool getServoShouldBeOn();
  bool isInTheTimeRanges(NTPClient timeClient);
  string getHours();
  string getMinutes();
  void setActivationCategory(JsonObject inputDoc);
  void setAnyWeigth(JsonObject inputDoc);
  void setServoShouldBeOn(JsonObject inputDoc);
  void setHours(JsonObject inputDoc);
  void setMinutes(JsonObject inputDoc);
  void setData(JsonObject inputDoc);
  void setServoShouldBeOn(bool stateServo);
  void setActivationCategory(bool inputDoc);
  void reportDataToMqttClientController(MqttClientController &mqtt);
  void activateServoMotor(ServoMotor servo);
  void stopServoMotor(ServoMotor servo);
  ~Esp32();
};
#endif