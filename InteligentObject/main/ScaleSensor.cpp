#include <iterator>
#include"ScaleSensor.h"
ScaleSensor::ScaleSensor(byte dataPin,byte sckPin):sensor(){
  this->dataPin=dataPin;
  this->sckPin=sckPin;
  sensor.begin(dataPin,sckPin);
}

void ScaleSensor::calibrate(long int tare){
    sensor.set_scale();
    delay(1000);
    Serial.println("tare remove weight");
    Serial.println("tare done");
    if(tare==0){
    sensor.set_scale();
    sensor.tare();
    }else{

    sensor.set_offset(tare);
    }

    
    // delay(100);
    // sensor.tare();
}
double ScaleSensor::getWeigth(){
  double weigth=-1.0;
  if(sensor.is_ready()){
  Serial.println(sensor.get_offset());
    Serial.println("put weight");
    weigth=sensor.get_units(SAMPLE_SIZE)/CALIBRATION_CONST;
  Serial.println(weigth);
  }
  return weigth;
}
ScaleSensor::~ScaleSensor(){
}