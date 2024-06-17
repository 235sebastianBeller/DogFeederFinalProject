#include "Esp32.h"

Esp32::Esp32()
{
  activationCategory=false;
  plateState=false;
  previousWeigth=0;
  foodPortion=50;
}
bool Esp32::isInTheTimeRanges(NTPClient timeClient){
  bool isTime=false;
  istringstream hoursIss(hours);
  istringstream minutesIss(minutes);
  int hour;
  int minute;
  while(hoursIss && minutesIss)
  {
    hoursIss >> hour;
    minutesIss >> minute;
    if(timeClient.getHours()==hour && timeClient.getMinutes()==minute)
      isTime=true;
  }
  return isTime;
}
void Esp32::setActivationCategory(JsonObject inputDoc){
  if(!inputDoc["activationCategory"].isNull())
    activationCategory= inputDoc["activationCategory"].as<bool>();
}
void Esp32::setHours(JsonObject inputDoc){
  if(!inputDoc["hoursToFeed"].isNull())
    hours= inputDoc["hoursToFeed"].as<string>();
}
void Esp32::setPlateState(JsonObject inputDoc){
    if(!inputDoc["plateState"].isNull())
      plateState= inputDoc["plateState"].as<bool>();
}
void Esp32::setMinutes(JsonObject inputDoc){
  if(!inputDoc["minutesToFeed"].isNull())
    minutes= inputDoc["minutesToFeed"].as<string>();
}
void Esp32::setFoodPortion(JsonObject inputDoc){
  if(!inputDoc["foodPortion"].isNull())
    foodPortion= inputDoc["foodPortion"].as<int>();
}
void Esp32::setWeigth(float weigth){
    this->weigth=weigth;
}
void Esp32::reportDataToMqttClientController(MqttClientController& mqtt){
  StaticJsonDocument<SIZE_OUTPUT> outputDoc;
  outputDoc["state"]["reported"]="";
  JsonObject reported =outputDoc["state"]["reported"].to<JsonObject>();
  reported["activationCategory"] =activationCategory;
  reported["hoursToFeed"] = hours;
  reported["minutesToFeed"] = minutes;
  reported["foodPortion"] = foodPortion;
  reported["plateState"] = weigth>foodPortion;
  mqtt.publishOnTopic(outputDoc,UPDATE_TOPIC);
}
void Esp32::setData(JsonObject inputDoc){
  setActivationCategory(inputDoc);
  setFoodPortion(inputDoc);
  setHours(inputDoc);
  setMinutes(inputDoc);
}

void Esp32::setPlateState(bool plateState){
  this->plateState=plateState;
}
void Esp32::setActivationCategory(bool activationCategory){
  this->activationCategory=activationCategory;
}
bool Esp32::isServoMovementRequired(NTPClient timeClient){
  return (!plateState)&&( 
    isInTheTimeRanges(timeClient)
    || (activationCategory)
    ) ;
}
void Esp32::handleTheWeightPublication(MqttClientController& mqtt){
    StaticJsonDocument<SIZE_OUTPUT> outputDoc; 
    if(weigth==-1){
      return;
    }

    bool plateState =weigth>foodPortion; 
    setPlateState(plateState);
      if(abs(previousWeigth-weigth)>1){
        Serial.println("Previo"+String(previousWeigth));
        Serial.println("Peso"+String(weigth));
        outputDoc["state"]["reported"]["plateState"] =plateState;
        float gramsEaten=max(previousWeigth,(float)0.0)-max(weigth,(float)0.0);
        if(gramsEaten>0){
        outputDoc["state"]["reported"]["gramsEaten"]=gramsEaten; 
        }    
        mqtt.publishOnTopic(outputDoc,UPDATE_TOPIC);
        previousWeigth=weigth;
      }
}

Esp32::~Esp32()
{
}