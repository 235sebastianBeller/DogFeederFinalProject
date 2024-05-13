#include "WifiController.h"

WifiController::WifiController(char *WifiSsid, char *WifiPassword) : wifiClient()
{
  this->WifiSsid = WifiSsid;
  this->WifiPassword = WifiPassword;
}

void WifiController::connectToWifi()
{
  WiFi.begin(WifiSsid, WifiPassword);
  while (WiFi.status() != WL_CONNECTED)
  {
    delay(STAND_BY_DELAY);
    Serial.print(".");
  }
  Serial.println(" Connected to" + String(WifiSsid));
}

WiFiClient &WifiController::getWiFiClient()
{
  return wifiClient;
}

WifiController::~WifiController()
{
}

void WifiController::setCACert(const char *amazonRootCa1)
{
  wifiClient.setCACert(amazonRootCa1);
}

void WifiController::setCertificate(const char *certificate)
{
  wifiClient.setCertificate(certificate);
}

void WifiController::setTLSConnections(const char *amazonRootCa1, const char *certificate, const char *privateKey)
{
  setCACert(amazonRootCa1);
  setCertificate(certificate);
  setPrivateKey(privateKey);
}

void WifiController::setPrivateKey(const char *privateKey)
{
  wifiClient.setPrivateKey(privateKey);
}