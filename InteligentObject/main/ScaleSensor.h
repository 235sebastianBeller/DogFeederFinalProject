#ifndef SCALESENSOR_H
#define SCALESENSOR_H
#include <Arduino.h>
#include"HX711.h"
#include"constants.h"
#include <EEPROM.h>
#include "MqttClientController.h"
class ScaleSensor {
private:
    byte dataPin;
    byte sckPin; 
    HX711 sensor;
    long tare;
public:
    ScaleSensor(byte dataPin,byte sckPin);
    void calibrate(int tare);
    double getWeigth();
    ~ScaleSensor();
};

#endif