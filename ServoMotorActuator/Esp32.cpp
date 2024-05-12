#include "Esp32.h"

Esp32::Esp32()
{
  activationCategory=0;
  anyWeigth=0;
  servoShouldBeOn=0;
  Serial.println("entre");
}
bool Esp32::getActivationCategory(){
  return activationCategory;
}
bool Esp32::getAnyWeigth(){
  return anyWeigth;
}
bool Esp32::getServoShouldBeOn(){
  return servoShouldBeOn;
}
bool Esp32::isInTheTimeRanges(NTPClient timeClient){
  bool isTime=false;
  istringstream hours(getHours());
  istringstream minutes(getMinutes());
  int hour;
  int minute;
  while(hours && minutes)
  {
    hours >> hour;
    minutes >> minute;
 if(timeClient.getHours()==hour && timeClient.getMinutes()==minute){
    isTime=true;
 }
  }
  return isTime;
}
string Esp32:: getHours (){
  return hours;
}
string Esp32::getMinutes(){
  return minutes;
}
void Esp32::setActivationCategory(JsonObject inputDoc){
  if(!inputDoc["activationCategory"].isNull())
    activationCategory= inputDoc["activationCategory"].as<bool>();
}
void Esp32::setAnyWeigth(JsonObject inputDoc){
  if(!inputDoc["anyWeigth"].isNull())
    anyWeigth= inputDoc["anyWeigth"].as<bool>();
}
void Esp32::setServoShouldBeOn(JsonObject inputDoc){
  if(!inputDoc["servoShouldBeOn"].isNull())
    servoShouldBeOn= inputDoc["servoShouldBeOn"].as<bool>();

}
void Esp32::setHours(JsonObject inputDoc){
  if(!inputDoc["hoursToFeed"].isNull())
    hours= inputDoc["hoursToFeed"].as<string>();
}
void Esp32::setMinutes(JsonObject inputDoc){
  if(!inputDoc["minutesToFeed"].isNull())
    minutes= inputDoc["minutesToFeed"].as<string>();
}
void Esp32::setServoShouldBeOn(bool servoState){
  servoShouldBeOn=servoState;
}
void Esp32::reportDataToMqttClientController(MqttClientController& mqtt){
  StaticJsonDocument<SIZE_OUTPUT> outputDoc; 
  outputDoc["state"]["reported"]["activationCategory"] = getActivationCategory();
  outputDoc["state"]["reported"]["anyWeigth"] = getAnyWeigth();
  outputDoc["state"]["reported"]["servoShouldBeOn"] =getServoShouldBeOn();
  outputDoc["state"]["reported"]["hoursToFeed"] = getHours();
  outputDoc["state"]["reported"]["minutesToFeed"] = getMinutes();
  mqtt.publishOnTopic(outputDoc,UPDATE_TOPIC);

}
void Esp32::setData(JsonObject inputDoc){
  setActivationCategory(inputDoc);
  setAnyWeigth(inputDoc);
  setServoShouldBeOn(inputDoc);
  setHours(inputDoc);
  setMinutes(inputDoc);
}
void Esp32::setActivationCategory(bool activationCategory){
  this->activationCategory=activationCategory;
}
void Esp32::activateServoMotor(ServoMotor servo){
      servo.start();
}
void Esp32::stopServoMotor(ServoMotor servo){
  servo.stop();
}

Esp32::~Esp32()
{
}