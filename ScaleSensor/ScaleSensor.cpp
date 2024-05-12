#include <iterator>
#include"ScaleSensor.h"
ScaleSensor::ScaleSensor(byte dataPin,byte sckPin):sensor(){
  this->dataPin=dataPin;
  this->sckPin=sckPin;
  sensor.begin(dataPin,sckPin);
}

void ScaleSensor::calibrate(){
    sensor.set_scale();
    delay(5000);
    sensor.tare();
    Serial.println("tare remove weight");
    Serial.println("tare done");
    // sensor.set_scale();
    // delay(100);
    // sensor.tare();
}
double ScaleSensor::getWeigth(){
  double weigth=-1.0;
  if(sensor.is_ready()){
    Serial.println("put weight");
    delay(800);
    weigth=sensor.get_units(SAMPLE_SIZE)/CALIBRATION_CONST;
  Serial.println(weigth);

    // weigth=sensor.get_units(SAMPLE_SIZE);

    // Serial.println(weigth);

  }
  return weigth;
}
ScaleSensor::~ScaleSensor(){
}