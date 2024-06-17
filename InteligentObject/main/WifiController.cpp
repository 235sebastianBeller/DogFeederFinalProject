#include"WifiController.h"

WifiController::WifiController():wifiClient(),wifiManager(){
}


WiFiClient & WifiController::getWiFiClient(){
  return wifiClient;
}
bool WifiController::autoConnectToAnyWifi(){
  return wifiManager.autoConnect(WIFI_SSID_AUTO_CONECCTION,WIFI_PASS_AUTO_CONECCTION);
}
WifiController::~WifiController(){
}

void WifiController::setCACert(const char * amazonRootCa1){
    wifiClient.setCACert(amazonRootCa1);
}

void WifiController::setCertificate(const char * certificate){
  wifiClient.setCertificate(certificate);
}

void WifiController::setTLSConnections(const char *amazonRootCa1, const char *certificate, const char *privateKey){
  setCACert(amazonRootCa1);
  setCertificate(certificate);
  setPrivateKey(privateKey);
}

void WifiController::setPrivateKey(const char * privateKey){
  wifiClient.setPrivateKey(privateKey);
}