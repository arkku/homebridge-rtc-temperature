# RTC Temperature Homebridge Plugin

## Introduction

This repository contains a Homebridge plugin, which can read temperature from
a file, apply a configurable divisor to the number, and report it to
Homebridge.

The intended use is with the temperature sensor in a Real-Time Clock (RTC)
chip, such as the DS3231, which I use with my Raspberry Pi.

Only Celsius units are supported.

~ [Kimmo Kulovesi](https://arkku.dev/), 2021-08-10

## Configuration

``` json
"accessories": [
    {
      "accessory": "homebridge-rtc-temperature.RTCTemperature",
      "name": "Raspberry Pi Temperature",
      "source": "/sys/bus/i2c/devices/1-0068/hwmon/hwmon2/temp1_input",
      "divisor": 1000,
      "interval_ms": 2000
    }
]
```

You could theoretically use this to get the temperature of the Raspberry Pi
CPU itself, although that would mean that HomeKit would report very high
temperatures in your home.
