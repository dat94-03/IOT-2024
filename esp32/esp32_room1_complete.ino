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
#define MQ2PIN 34
#define BUZZER_PIN 5
#define BUTTON_PIN 15

WiFiClientSecure wifiClient;
PubSubClient mqttClient(wifiClient);

const char *WifiSSID = "July1992 Coffee";
const char *WifiPassword = "July1992"; //wifi nhà 
const char *mqttServer = "d2d60be70c7847508b58bd5018279da5.s1.eu.hivemq.cloud";

int mqttPort = 8883;
const char *mqtt_username = "AnhDuc";
const char *mqtt_password = "DucIot2024";
const char *topicPublish = "iot_hust_2024/data";

const char *topicSubcribe = "iot_hust/command";
const char *roomId1 = "62ce96c7cd95012e5f7155e1";

StaticJsonDocument<256> sendingValueSensor;

volatile bool buzzerState = false;
DHT dht(DHTPIN, DHTTYPE);
ezButton button(BUTTON_PIN);
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
  pinMode(BUZZER_PIN, OUTPUT);
  digitalWrite(BUZZER_PIN, LOW);
  button.setDebounceTime(50);

  dht.begin();
  sendingValueSensor["roomId"] = roomId1;

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
    mqttClient.setCallback(callback);
    Serial.println("Connecting to MQTT Broker...");
    while (!mqttClient.connected()) {
      Serial.println("Reconnecting to MQTT Broker..");
      String clientId = "ESP32Client-";
      clientId += String(random(0xffff), HEX);

      if (mqttClient.connect(clientId.c_str(), mqtt_username, mqtt_password)) {
         Serial.println("Connected to MQTT Broker!.");
         mqttClient.subscribe(topicSubcribe);
      } else {
          Serial.print("failed with state ");
          Serial.print(mqttClient.state());
          delay(2000);
      }
     }
   }
   mqttClient.loop();

  button.loop();

  if (button.isPressed()) {
    buzzerState = false;
    digitalWrite(BUZZER_PIN, LOW);
    Serial.println("Buzzer turned off by button press");
    Serial.println("hello my fr");
  }

  if (start < delayTime) {
    start++;
  } else {
    start = 0;
    float humi = dht.readHumidity();
    float tempC = dht.readTemperature();
    int gasLevel = analogRead(MQ2PIN);
    gasLevel = map(gasLevel, 0, 4095, 0, 100);

    if (isnan(tempC) || isnan(humi)) {
      Serial.println("Failed to read from DHT sensor!");
    } else {
      sendingValueSensor["temperature"] = tempC;
      sendingValueSensor["humidity"] = humi;
      sendingValueSensor["gasLevel"] = gasLevel;
      sendingValueSensor["roomId"] = roomId1;

      char outData[256];
      serializeJson(sendingValueSensor, outData);
      mqttClient.publish(topicPublish, outData);

      Serial.print("Temperature: ");
      Serial.print(tempC);
      Serial.print("°C, Humidity: ");
      Serial.print(humi);
      Serial.print("%, Gas Level: ");
      Serial.print(gasLevel);
      Serial.println("%");

      if (gasLevel > 5 && !buzzerState) {
    digitalWrite(BUZZER_PIN, HIGH);
    buzzerState = true;
    Serial.println("Gas level high! Buzzer activated.");
    // TODO: Add MQTT message to notify about buzzer activation if required
  }
    }
  }
}

void callback(char *topic, byte *payload, unsigned int length) {
  Serial.print("Received message: ");
  String message = "";
  for (unsigned int i = 0; i < length; i++) {
    Serial.print((char)payload[i]);
    message += (char)payload[i];
  }
  Serial.println();
  Serial.print("Co tin nhan moi tu topic:");
  Serial.println(topic);

  // If the received message is "off buzzer", turn off the buzzer without pressing the button
  if (message == "off buzzer") {
    Serial.println("Turning off buzzer via MQTT command");
    digitalWrite(BUZZER_PIN, LOW);
    buzzerState = false;
  }

}

