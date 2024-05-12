#include"MqttClientController.h"


MqttClientController::MqttClientController(char * mqttBrokerHost, int mqttBrokerPort ):mqttClient() {
  this->mqttBrokerHost=mqttBrokerHost;
  this->mqttBrokerPort=mqttBrokerPort;

}

void MqttClientController::setServerForMqtt(WifiController& wifiController){
  mqttClient.setClient(wifiController.getWiFiClient());
  mqttClient.setServer(mqttBrokerHost, mqttBrokerPort);
}
void MqttClientController::standBy(){
      delay(STAND_BY_DELAY);
      Serial.print("*");
}
void MqttClientController::connectWithClientId(String clientId){
  Serial.println("Connecting to " + String(clientId));
  mqttClient.disconnect();
  mqttClient.connect(clientId.c_str());
  while (mqttClient.state()!=MQTT_CONNECTED) 
      standBy();
  Serial.println(" Connected!");
}



void MqttClientController::suscribeToTheTopics(){
  for(int i=0;i<COUNT_TOPICS;i++){
      subscribeToATopic(topics[i]);
      delay(400);
  }
}

void MqttClientController::publishOnTopic( StaticJsonDocument<SIZE_OUTPUT> outputDoc,String publishTopic){
    if (!mqttClient.connected()) {
        Serial.println("MQTT broker not connected!");
        delay(LIMIT_DELAY);
        connectWithClientId(CLIENT_ID);
        suscribeToTheTopics();
      return;
    }
      serializeJson(outputDoc, outputBuffer);
      Serial.println(outputBuffer);
      mqttClient.publish(publishTopic.c_str(), outputBuffer);
}
void MqttClientController::setCallback(void (*callback)(const char *, byte *, unsigned int )){
  mqttClient.setCallback(callback);
}
void MqttClientController::startListening()
{
  mqttClient.loop();
}
void MqttClientController::subscribeToATopic(String subscribeTopic)
{
  Serial.println("Subscribing to " + String(subscribeTopic));
  while (!mqttClient.subscribe(subscribeTopic.c_str()))
    standBy();
  Serial.println(" Subscribed!");
}

MqttClientController::~MqttClientController(){
}