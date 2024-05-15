#ifndef MQTTCLIENTCONTROLLER_H
#define MQTTCLIENTCONTROLLER_H
#include <WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include "WifiController.h"
#include "constants.h"
#include "AuthenticationConstants.h"
class MqttClientController
{
private:
  char *mqttBrokerHost;
  int mqttBrokerPort;
  PubSubClient mqttClient;
  unsigned long previousPublishMillis;
  char outputBuffer[128];

public:
  MqttClientController(char *mqttBrokerHost, int mqttBrokerPort);
  void setServerForMqtt(WifiController &wifiController);
  void connectWithClientId(String clientId);
  void standBy();
  void publishOnTopic(StaticJsonDocument<JSON_OBJECT_SIZE(1)> &outputDoc, String publishTopic);
  void suscribeOnTopic(String topic);
  bool isTime(unsigned long previousMillis, unsigned long nowMillis);
  ~MqttClientController();
};
#endif