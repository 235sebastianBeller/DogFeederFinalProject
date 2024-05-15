#include "WifiController.h"
#include "MqttClientController.h"
#include "constants.h"
#include "AuthenticationConstants.h"
#include "ScaleSensor.h"
WifiController wifiController(WIFI_SSID, WIFI_PASS);
MqttClientController mqttController(MQTT_BROKER_HOST, MQTT_BROKER_PORT);
ScaleSensor scaleSensor(DATA_PIN, SCK_PIN);
StaticJsonDocument<JSON_OBJECT_SIZE(1)> outputDoc;

void setup()
{
  Serial.begin(TRANSMISSION_SPEED);
  wifiController.connectToWifi();
  wifiController.setCACert(AMAZON_ROOT_CA1);
  wifiController.setCertificate(CERTIFICATE);
  wifiController.setPrivateKey(PRIVATE_KEY);
  mqttController.setServerForMqtt(wifiController);
  mqttController.connectWithClientId(CLIENT_ID);
  delay(800);
  mqttController.suscribeOnTopic(UPDATE_TOPIC);
  scaleSensor.calibrate();
}

void loop()
{
  float weigth = scaleSensor.getWeigth();
  outputDoc["state"]["reported"]["weigth"] = weigth;
  if (weigth != -1)
  {
    mqttController.publishOnTopic(outputDoc, UPDATE_TOPIC);
  }
}
