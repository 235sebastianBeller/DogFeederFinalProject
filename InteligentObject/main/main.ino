#include "WifiController.h"
#include "MqttClientController.h"
#include "constants.h"
#include"AuthenticationConstants.h"
#include <NTPClient.h>
#include"Esp32.h"
#include "ServoMotor.h"
#include "ScaleSensor.h"
#include <EEPROM.h>
using namespace std;

WiFiUDP ntpUDP;
NTPClient timeClient(ntpUDP, "pool.ntp.org", utcOffsetInSeconds);
MqttClientController  mqttController(MQTT_BROKER_HOST,MQTT_BROKER_PORT); 
Esp32 esp;
ServoMotor servoMotor(SIGNAL_PIN);
ScaleSensor scaleSensor(DATA_PIN,SCK_PIN);
StaticJsonDocument<SIZE_INPUT> inputDoc;
float weigth;

void callback(const char *topic, byte *payload, unsigned int length)
{
  DeserializationError err = deserializeJson(inputDoc, payload);
  if (err){
    return;
  } 
  if (String(topic) == GET_DATA_DOG_FEEDER_TOPIC || String(topic) == UPDATE_DELTA_TOPIC) {
      weigth=scaleSensor.getWeigth();
      esp.setWeigth(weigth);
      esp.setData(inputDoc["state"]);
      esp.reportDataToMqttClientController(mqttController);
    }
  }
WifiController wifiController;

void setup() {
  WiFi.mode(WIFI_STA);
  StaticJsonDocument<SIZE_OUTPUT> outputDoc; 
  Serial.begin(TRANSMISSION_SPEED);
  bool res=wifiController.autoConnectToAnyWifi();
  Serial.println(res);
  if(!res){
    Serial.println("Failed to connect");
    return ;
  }
  Serial.println("Connected to Wifi!!!");
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
  scaleSensor.calibrate(-226799);
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
  weigth=scaleSensor.getWeigth();
  esp.setWeigth(weigth);
  esp.handleTheWeightPublication(mqttController);
  handleServoMotorRotation();
  mqttController.startListening();

}