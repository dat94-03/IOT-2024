#include <PubSubClient.h>
#include <WiFi.h>
#include <WiFiClient.h>
#include <WiFiServer.h>
#include <WiFiUdp.h>
#include <WiFiClientSecure.h>
#include <ArduinoJson.h>
#include <DHT.h>
#include "ezButton.h"

#define DHTPIN 4
#define DHTTYPE DHT11

WiFiClientSecure wifiClient;
PubSubClient mqttClient(wifiClient); 
char *mqttServer = "d2d60be70c7847508b58bd5018279da5.s1.eu.hivemq.cloud";
// const char *WifiSSID = "July1992 Coffee";
// const char *WifiPassword = "July1992"; //wifi nhà 
// const char *mqttServer = "d2d60be70c7847508b58bd5018279da5.s1.eu.hivemq.cloud";

// int mqttPort = 8883;
// const char *mqtt_username = "AnhDuc";
// const char *mqtt_password = "DucIot2024";
// const char *topicPublish = "iot_hust_2024/data";
int mqttPort = 8883;
const char *mqtt_username = "AnhDuc";
const char *mqtt_password = "DucIot2024";
const char *WifiSSID = "July1992coffee";
const char *WifiPassword = "July1992";
const char *topicSubcribe = "iot_haobinhtuan_hust/command";
const char *topicPublish = "iot_haobinhtuan_hust/data";
const char *ledId1 = "640ee113bf49af0a529390ad";
const char *ledId2 = "640ee119bf49af0a529390b1";
const char *tempId = "640ee2c0246bf48329d6deb1";
const char *humiId = "640ee2b1246bf48329d6dead";
const char *homeId = "62ce96a2cd95012e5f7155de";
const char *roomId1 = "62ce96c7cd95012e5f7155e1";
const char *roomId2 = "62ce96cfcd95012e5f7155e4";

StaticJsonDocument<256> sendingStatusLed;
StaticJsonDocument<256> sendingValueSensor;

volatile byte state1 = HIGH;
volatile byte state2 = HIGH;
int LED1 = 5;
int LED2 = 23;

ezButton button1(32);
ezButton button2(33);
DHT dht(DHTPIN, DHTTYPE);
unsigned long start = 0, delayTime = 200000;

const char *ROOT_CERT = "-----BEGIN CERTIFICATE-----\n" \
"MIIFYDCCBEigAwIBAgIQQAF3ITfU6UK47naqPGQKtzANBgkqhkiG9w0BAQsFADA/\n" \
"MSQwIgYDVQQKExtEaWdpdGFsIFNpZ25hdHVyZSBUcnVzdCBDby4xFzAVBgNVBAMT\n" \
"DkRTVCBSb290IENBIFgzMB4XDTIxMDEyMDE5MTQwM1oXDTI0MDkzMDE4MTQwM1ow\n" \
"TzELMAkGA1UEBhMCVVMxKTAnBgNVBAoTIEludGVybmV0IFNlY3VyaXR5IFJlc2Vh\n" \
"cmNoIEdyb3VwMRUwEwYDVQQDEwxJU1JHIFJvb3QgWDEwggIiMA0GCSqGSIb3DQEB\n" \
"AQUAA4ICDwAwggIKAoICAQCt6CRz9BQ385ueK1coHIe+3LffOJCMbjzmV6B493XC\n" \
"ov71am72AE8o295ohmxEk7axY/0UEmu/H9LqMZshftEzPLpI9d1537O4/xLxIZpL\n" \
"wYqGcWlKZmZsj348cL+tKSIG8+TA5oCu4kuPt5l+lAOf00eXfJlII1PoOK5PCm+D\n" \
"LtFJV4yAdLbaL9A4jXsDcCEbdfIwPPqPrt3aY6vrFk/CjhFLfs8L6P+1dy70sntK\n" \
"4EwSJQxwjQMpoOFTJOwT2e4ZvxCzSow/iaNhUd6shweU9GNx7C7ib1uYgeGJXDR5\n" \
"bHbvO5BieebbpJovJsXQEOEO3tkQjhb7t/eo98flAgeYjzYIlefiN5YNNnWe+w5y\n" \
"sR2bvAP5SQXYgd0FtCrWQemsAXaVCg/Y39W9Eh81LygXbNKYwagJZHduRze6zqxZ\n" \
"Xmidf3LWicUGQSk+WT7dJvUkyRGnWqNMQB9GoZm1pzpRboY7nn1ypxIFeFntPlF4\n" \
"FQsDj43QLwWyPntKHEtzBRL8xurgUBN8Q5N0s8p0544fAQjQMNRbcTa0B7rBMDBc\n" \
"SLeCO5imfWCKoqMpgsy6vYMEG6KDA0Gh1gXxG8K28Kh8hjtGqEgqiNx2mna/H2ql\n" \
"PRmP6zjzZN7IKw0KKP/32+IVQtQi0Cdd4Xn+GOdwiK1O5tmLOsbdJ1Fu/7xk9TND\n" \
"TwIDAQABo4IBRjCCAUIwDwYDVR0TAQH/BAUwAwEB/zAOBgNVHQ8BAf8EBAMCAQYw\n" \
"SwYIKwYBBQUHAQEEPzA9MDsGCCsGAQUFBzAChi9odHRwOi8vYXBwcy5pZGVudHJ1\n" \
"c3QuY29tL3Jvb3RzL2RzdHJvb3RjYXgzLnA3YzAfBgNVHSMEGDAWgBTEp7Gkeyxx\n" \
"+tvhS5B1/8QVYIWJEDBUBgNVHSAETTBLMAgGBmeBDAECATA/BgsrBgEEAYLfEwEB\n" \
"ATAwMC4GCCsGAQUFBwIBFiJodHRwOi8vY3BzLnJvb3QteDEubGV0c2VuY3J5cHQu\n" \
"b3JnMDwGA1UdHwQ1MDMwMaAvoC2GK2h0dHA6Ly9jcmwuaWRlbnRydXN0LmNvbS9E\n" \
"U1RST09UQ0FYM0NSTC5jcmwwHQYDVR0OBBYEFHm0WeZ7tuXkAXOACIjIGlj26Ztu\n" \
"MA0GCSqGSIb3DQEBCwUAA4IBAQAKcwBslm7/DlLQrt2M51oGrS+o44+/yQoDFVDC\n" \
"5WxCu2+b9LRPwkSICHXM6webFGJueN7sJ7o5XPWioW5WlHAQU7G75K/QosMrAdSW\n" \
"9MUgNTP52GE24HGNtLi1qoJFlcDyqSMo59ahy2cI2qBDLKobkx/J3vWraV0T9VuG\n" \
"WCLKTVXkcGdtwlfFRjlBz4pYg1htmf5X6DYO8A4jqv2Il9DjXA6USbW1FzXSLr9O\n" \
"he8Y4IWS6wY7bCkjCWDcRQJMEhg76fsO3txE+FiYruq9RUWhiF1myv4Q6W+CyBFC\n" \
"Dfvp7OOGAN6dEOM4+qR9sdjoSYKEBpsr6GtPAQw4dy753ec5\n" \
"-----END CERTIFICATE-----";

void setup() {
  Serial.begin(9600);
  pinMode(LED1, OUTPUT);
  pinMode(LED2, OUTPUT);

  button1.setDebounceTime(50);
  button2.setDebounceTime(50);
  digitalWrite(LED1, state1);
  digitalWrite(LED2, state2);

  dht.begin();
  sendingStatusLed["homeId"] = homeId;
  sendingValueSensor["homeId"] = homeId;
  sendingValueSensor["roomId"] = roomId1;
  
  // Connect to Wi-Fi network
  Serial.print("Connecting to ");
  Serial.println(WifiSSID);
  WiFi.begin(WifiSSID, WifiPassword);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.println("...Still Connecting");
  }

  Serial.println("");
  Serial.println("WiFi connected.");


  wifiClient.setCACert(ROOT_CERT);
}

void loop(){
  if (!mqttClient.connected()) {    
    mqttClient.setServer(mqttServer, mqttPort);
    // set the callback function
    mqttClient.setCallback(callback);
    Serial.println("Connecting to MQTT Broker...");
    while (!mqttClient.connected()) {
      Serial.println("Reconnecting to MQTT Broker..");
      String clientId = "ESP32Client-";
      clientId += String(random(0xffff), HEX);

      if (mqttClient.connect(clientId.c_str(), mqtt_username, mqtt_password)) {
         Serial.println("Connected to MQTT BRoker!.");
         // subscribe to topic
         mqttClient.subscribe(topicSubcribe);
      } else {
          Serial.print("failed with state ");
          Serial.print(mqttClient.state());
          delay(2000);
      }
     }
   }
   mqttClient.loop();

  button1.loop();
  button2.loop();
  if (button1.isPressed())
  {
    state1 = !state1;
    digitalWrite(LED1, state1);
    sendingStatusLed["roomId"] = roomId1;
    sendingStatusLed["name"] = "status";
    sendingStatusLed["value"] = state1 ? "ON" : "OFF";
    sendingStatusLed["deviceId"] = ledId1;
    char out[256];
    serializeJson(sendingStatusLed, out);
    mqttClient.publish(topicPublish, out, true);
    Serial.print("Pin status (LED1): ");
    Serial.println(state1);
  }
  if (button2.isPressed())
  {
    state2 = !state2;
    digitalWrite(LED2, state2);
    sendingStatusLed["roomId"] = roomId2;
    sendingStatusLed["name"] = "status";
    sendingStatusLed["value"] = state2 ? "ON" : "OFF";
    sendingStatusLed["deviceId"] = ledId2;
    char out[256];
    serializeJson(sendingStatusLed, out);
    mqttClient.publish(topicPublish, out, true);
    Serial.print("Pin status (LED2): ");
    Serial.println(state2);
  }
  if (start < delayTime)
  {
    start++;
  }
  else
  {
    start = 0;
    float humi = dht.readHumidity();
    // read temperature in Celsius
    float tempC = dht.readTemperature();
    // read temperature in Fahrenheit
    float tempF = dht.readTemperature(true);

    // check whether the reading is successful or not
    if (isnan(tempC) || isnan(tempF) || isnan(humi))
    {
      Serial.println("Failed to read from DHT sensor!");
    }
    else
    {
      sendingValueSensor["name"] = "humidity";
      sendingValueSensor["deviceId"] = humiId;
      sendingValueSensor["value"] = humi;
      char outHumi[256];
      serializeJson(sendingValueSensor, outHumi);
      mqttClient.publish(topicPublish, outHumi);
      Serial.print("Humidity: ");
      Serial.print(humi);
      Serial.print("%");
      Serial.print("  |  ");
      char outTemp[256];
      sendingValueSensor["name"] = "temperature";
      sendingValueSensor["deviceId"] = tempId;
      sendingValueSensor["value"] = tempC;
      serializeJson(sendingValueSensor, outTemp);
      mqttClient.publish(topicPublish, outTemp);
      Serial.print("Temperature: ");
      Serial.print(tempC);
      Serial.print("°C  ~  ");
      Serial.print(tempF);
      Serial.println("°F");
    }
  }
}

void callback(char *topic, byte *payload, unsigned int length)
{
  Serial.print("Co tin nhan moi tu topic:");
  Serial.println(topic);
  StaticJsonDocument<256> doc;
  deserializeJson(doc, payload);

  if (doc["value"] == "ON")
  {
    if (strcmp(doc["deviceId"], ledId1) == 0 && state1 == LOW)
    {
      Serial.println("LED1 on");
      digitalWrite(LED1, HIGH);
      state1 = HIGH;
      sendingStatusLed["roomId"] = roomId1;
      sendingStatusLed["name"] = "status";
      sendingStatusLed["value"] = "ON";
      sendingStatusLed["deviceId"] = ledId1;
      char out[256];
      serializeJson(sendingStatusLed, out);
      mqttClient.publish(topicPublish, out, true);
    }
    else if (strcmp(doc["deviceId"], ledId2) == 0 && state2 == LOW)
    {
      Serial.println("LED2 on");
      digitalWrite(LED2, HIGH);
      state2 = HIGH;
      sendingStatusLed["roomId"] = roomId2;
      sendingStatusLed["name"] = "status";
      sendingStatusLed["value"] = "ON";
      sendingStatusLed["deviceId"] = ledId2;
      char out[256];
      serializeJson(sendingStatusLed, out);
      mqttClient.publish(topicPublish, out, true);
    }
  }
  else if (doc["value"] == "OFF")
  {
    if (strcmp(doc["deviceId"], ledId1) == 0 && state1 == HIGH)
    {
      Serial.println("LED off");
      digitalWrite(LED1, LOW);
      state1 = LOW;
      sendingStatusLed["roomId"] = roomId1;
      sendingStatusLed["name"] = "status";
      sendingStatusLed["value"] = "OFF";
      sendingStatusLed["deviceId"] = ledId1;
      char out[256];
      serializeJson(sendingStatusLed, out);
      mqttClient.publish(topicPublish, out, true);
    }
    else if (strcmp(doc["deviceId"], ledId2) == 0 && state2 == HIGH)
    {
      Serial.println("LED off");
      digitalWrite(LED2, LOW);
      state2 = LOW;
      sendingStatusLed["roomId"] = roomId2;
      sendingStatusLed["name"] = "status";
      sendingStatusLed["value"] = "OFF";
      sendingStatusLed["deviceId"] = ledId2;
      char out[256];
      serializeJson(sendingStatusLed, out);
      mqttClient.publish(topicPublish, out, true);
    }
  }
}