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
  bool servoState;
  bool plateState;
  string hours;
  string minutes;

public:
  Esp32();
  bool getActivationCategory();
  bool getAnyWeigth();
  bool getServoState();
  bool isInTheTimeRanges(NTPClient timeClient);
  bool getPlateState();
  string getHours();
  string getMinutes();
  void setPlateState(JsonObject inputDoc);
  void setActivationCategory(JsonObject inputDoc);
  void setAnyWeigth(JsonObject inputDoc);
  void setHours(JsonObject inputDoc);
  void setMinutes(JsonObject inputDoc);
  void setData(JsonObject inputDoc);
  void setServoServoState(JsonObject inputDoc);
  void setActivationCategory(bool inputDoc);
  void setServoState(bool servoState);
  void setPlateState(bool plateState);
  void reportDataToMqttClientController(MqttClientController &mqtt);
  void activateServoMotor(ServoMotor servo);
  void stopServoMotor(ServoMotor servo);
  ~Esp32();
};
#endif