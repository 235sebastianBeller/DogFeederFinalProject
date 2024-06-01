#include "WifiController.h"
#include "MqttClientController.h"
#include "constants.h"
#include"AuthenticationConstants.h"
#include <NTPClient.h>
#include"Esp32.h"
#include "ServoMotor.h"
#include "ScaleSensor.h"

using namespace std;

WiFiUDP ntpUDP;
NTPClient timeClient(ntpUDP, "pool.ntp.org", utcOffsetInSeconds);
WifiController wifiController(WIFI_SSID,WIFI_PASS);
MqttClientController  mqttController(MQTT_BROKER_HOST,MQTT_BROKER_PORT); 
Esp32 esp;
ServoMotor servoMotor(SIGNAL_PIN);
ScaleSensor scaleSensor(DATA_PIN,SCK_PIN);
StaticJsonDocument<SIZE_INPUT> inputDoc;

void callback(const char *topic, byte *payload, unsigned int length)
{
  DeserializationError err = deserializeJson(inputDoc, payload);
  if (err){
    return;
  } 
  if (String(topic) == GET_DATA_DOG_FEEDER_TOPIC || String(topic) == UPDATE_DELTA_TOPIC) {
    Serial.println("ENTREEEE");
      esp.setData(inputDoc["state"]);
      esp.reportDataToMqttClientController(mqttController);
    }
  }


void setup() {
  StaticJsonDocument<SIZE_OUTPUT> outputDoc; 
  Serial.begin(TRANSMISSION_SPEED);
  wifiController.connectToWifi();
  wifiController.setTLSConnections(AMAZON_ROOT_CA1,CERTIFICATE,PRIVATE_KEY);
  mqttController.setServerForMqtt(wifiController);
  mqttController.connectWithClientId(CLIENT_ID);
  mqttController.setCallback(callback);
  mqttController.suscribeToTheTopics();
  outputDoc[""]="";
  delay(800);
  mqttController.publishOnTopic(outputDoc,GET_TOPIC);
  delay(800);
  timeClient.begin();
  scaleSensor.calibrate(-89409);
}




void handleServoMotorRotation(){
        if(esp.isServoMovementRequired(timeClient)){
          servoMotor.start();
        }
        else {
             servoMotor.stop();
      }
}

void loop() {
  timeClient.update();
  float weigth=scaleSensor.getWeigth();
  esp.handleTheWeightPublication(weigth,mqttController);
  handleServoMotorRotation();
  mqttController.startListening();
}