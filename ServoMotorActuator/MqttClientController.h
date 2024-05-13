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
  char outputBuffer[254];

public:
  MqttClientController(char *mqttBrokerHost, int mqttBrokerPort);
  void setServerForMqtt(WifiController &wifiController);
  void connectWithClientId(String clientId);
  void standBy();
  void subscribeToATopic(String subscribeTopic);
  void publishOnTopic(StaticJsonDocument<SIZE_OUTPUT> outputDoc, String publishTopic);
  void startListening();
  void suscribeToTheTopics();
  void setCallback(void (*callback)(const char *, byte *, unsigned int));
  ~MqttClientController();
};
#endif