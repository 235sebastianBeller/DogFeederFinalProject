#ifndef SCALESENSOR_H
#define SCALESENSOR_H
#include <Arduino.h>
#include"HX711.h"
#include"constants.h"
class ScaleSensor {
private:
    byte dataPin;
    byte sckPin; 
    HX711 sensor;
public:
    ScaleSensor(byte dataPin,byte sckPin);
    void calibrate();
    double getWeigth();
    ~ScaleSensor();
};

#endif