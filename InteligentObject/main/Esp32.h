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
  bool plateState;
  string hours;
  string minutes;
  float previousWeigth;
  float weigth;
  int foodPortion;

public:
  Esp32();
  string getHours();
  string getMinutes();
  bool isInTheTimeRanges(NTPClient timeClient);
  bool isServoMovementRequired(NTPClient timeClient);
  void setActivationCategory( JsonObject inputDoc);
  void setHours( JsonObject  inputDoc);
  void setMinutes( JsonObject  inputDoc);
  void setPlateState( JsonObject inputDoc);
  void setFoodPortion( JsonObject inputDoc);
  void setData( JsonObject  inputDoc);
  void reportDataToMqttClientController(MqttClientController& mqtt);
  void setWeigth(float weigth);
  void setActivationCategory(bool inputDoc);
  void setPlateState(bool plateState);
  void handleTheWeightPublication(MqttClientController& mqtt);
  ~Esp32();
};
#endif