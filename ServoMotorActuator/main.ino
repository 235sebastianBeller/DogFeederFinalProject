#include "WifiController.h"
#include "MqttClientController.h"
#include "constants.h"
#include "AuthenticationConstants.h"
#include <NTPClient.h>
#include "Esp32.h"
#include "ServoMotor.h"
using namespace std;

WiFiUDP ntpUDP;
NTPClient timeClient(ntpUDP, "pool.ntp.org", utcOffsetInSeconds);
WifiController wifiController(WIFI_SSID, WIFI_PASS);
MqttClientController mqttController(MQTT_BROKER_HOST, MQTT_BROKER_PORT);
Esp32 esp;
ServoMotor servoMotor(SIGNAL_PIN);
StaticJsonDocument<SIZE_INPUT> inputDoc;
StaticJsonDocument<SIZE_OUTPUT> outputDoc;

void callback(const char *topic, byte *payload, unsigned int length)
{

  DeserializationError err = deserializeJson(inputDoc, payload);
  if (err)
  {
    return;
  }
  if (String(topic) == GET_DATA_DOG_FEEDER_TOPIC || String(topic) == UPDATE_DELTA_TOPIC)
  {
    esp.setData(inputDoc["state"]);
    esp.reportDataToMqttClientController(mqttController);
  }
}

void setup()
{
  Serial.begin(TRANSMISSION_SPEED);
  wifiController.connectToWifi();
  wifiController.setTLSConnections(AMAZON_ROOT_CA1, CERTIFICATE, PRIVATE_KEY);
  mqttController.setServerForMqtt(wifiController);
  mqttController.connectWithClientId(CLIENT_ID);
  mqttController.setCallback(callback);
  mqttController.suscribeToTheTopics();
  outputDoc[""] = "";
  delay(400);
  mqttController.publishOnTopic(outputDoc, GET_TOPIC);
  timeClient.begin();
  delay(400);
}

int cont = 0;

void startToRotate()
{
  if (cont < 10000)
  {
    esp.activateServoMotor(servoMotor);
    esp.setServoShouldBeOn(true);
  }
  else
  {
    esp.stopServoMotor(servoMotor);
    esp.setServoShouldBeOn(false);
  }
  if (cont == 0 || cont == 10000)
  {
    Serial.println(cont);
    delay(800);
    esp.reportDataToMqttClientController(mqttController);
  }
  if (timeClient.getSeconds() == 0 && cont != 0)
  {
    cont = 0;
  }
  cont++;
}

void loop()
{
  timeClient.update();
  if (esp.getActivationCategory())
  {
    esp.activateServoMotor(servoMotor);
  }
  else if (esp.getServoShouldBeOn() || esp.isInTheTimeRanges(timeClient))
  {
    startToRotate();
  }
  else
  {
    cont = 0;
    esp.setServoShouldBeOn(false);
    esp.stopServoMotor(servoMotor);
  }
  mqttController.startListening();
}