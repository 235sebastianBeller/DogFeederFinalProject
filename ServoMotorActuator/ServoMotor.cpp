#include "ServoMotor.h"
ServoMotor::ServoMotor(byte signalPin)
{
  this->signalPin = signalPin;
  servo.attach(signalPin);
}

void ServoMotor::start()
{
  servo.write(80);
}

void ServoMotor::stop()
{
  servo.write(95);
}

ServoMotor::~ServoMotor()
{
}
