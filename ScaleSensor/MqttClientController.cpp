#include "MqttClientController.h"

MqttClientController::MqttClientController(char *mqttBrokerHost, int mqttBrokerPort) : mqttClient()
{
  this->mqttBrokerHost = mqttBrokerHost;
  this->mqttBrokerPort = mqttBrokerPort;
  previousPublishMillis = 0;
}

void MqttClientController::setServerForMqtt(WifiController &wifiController)
{
  mqttClient.setClient(wifiController.getWiFiClient());
  mqttClient.setServer(mqttBrokerHost, mqttBrokerPort);
}

void MqttClientController::suscribeOnTopic(String topic)
{
  mqttClient.subscribe(topic.c_str());
}

void MqttClientController::standBy()
{
  delay(STAND_BY_DELAY);
  Serial.print("*");
}

void MqttClientController::connectWithClientId(String clientId)
{
  Serial.println("Connecting to " + String(clientId));
  mqttClient.disconnect();
  mqttClient.connect(clientId.c_str());
  while (mqttClient.state() != MQTT_CONNECTED)
    standBy();
  Serial.println(" Connected!");
}

bool MqttClientController::isTime(unsigned long previousMillis, unsigned long nowMillis)
{
  return nowMillis - previousPublishMillis >= LIMIT_DELAY;
}

void MqttClientController::publishOnTopic(StaticJsonDocument<JSON_OBJECT_SIZE(1)> &outputDoc, String publishTopic)
{
  if (!mqttClient.connected())
  {
    Serial.println("MQTT broker not connected!");
    delay(LIMIT_DELAY);
    connectWithClientId(CLIENT_ID);
    suscribeOnTopic(UPDATE_TOPIC);
    return;
  }
  unsigned long now = millis();
  if (isTime(previousPublishMillis, now))
  {
    previousPublishMillis = now;
    serializeJson(outputDoc, outputBuffer);
    Serial.println(outputBuffer);
    Serial.println(mqttClient.publish(publishTopic.c_str(), outputBuffer));
  }
}

MqttClientController::~MqttClientController()
{
}