#ifndef WIFICONTROLLER_H
#define WIFICONTROLLER_H
#include <WiFiClientSecure.h>
#include"AuthenticationConstants.h"
#include"constants.h"

class WifiController {
  private:
      char * WifiSsid;
      char * WifiPassword;
      WiFiClientSecure wifiClient;
   
  public:
  WifiController(char * WifiSsid, char * WifiPassword);
  void connectToWifi();
  ~WifiController();
  WiFiClient &getWiFiClient();
    void setCACert(const char * amazonRootCa1);
   void setCertificate(const char * certificate);
   void setPrivateKey(const char * privateKey);
};
#endif