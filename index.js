var Service;
var Characteristic;
var Accessory;
var AccessoryType;
var UUIDGen;

const fs = require('fs');
const packageJSON = require("./package.json");

module.exports = function(homebridge) {
    Accessory = homebridge.platformAccessory;
    Service = homebridge.hap.Service;
    Characteristic = homebridge.hap.Characteristic;
    UUIDGen = homebridge.hap.uuid;

    homebridge.registerAccessory("homebridge-rtc-temperature", "RTCTemperature", RTCTemperature);
}

function RTCTemperature(log, config, api) {
    this.log = log;
    this.name = config["name"];
    this.api = api;

    if (config["source"]) {
        this.sourceFile = config["source"];
    } else {
        this.sourceFile = "/sys/bus/i2c/devices/1-0068/hwmon/hwmon2/temp1_input";
    }

    if (config["interval_ms"] && config["interval_ms"] > 0) {
        this.updateInterval = config["interval_ms"] + 0;
    } else {
        this.updateInterval = 1000;
    }

    if (config["divisor"] && config["divisor"] > 0) {
        this.divisor = config["divisor"] + 0;
    } else {
        this.divisor = 1000;
    }

    this.log.debug("RTCTemperature: " + this.name + ": " + this.sourceFile);
}

RTCTemperature.prototype = {
    identify: function(callback) {
        this.log.debug("Identify called " + this.name);
        callback();
    },

    getServices: function() {
        const that = this;

        const informationService = new Service.AccessoryInformation();
        informationService
            .setCharacteristic(Characteristic.Manufacturer, "arkku.dev")
            .setCharacteristic(Characteristic.Model, "RTC Temperature Sensor")
            .setCharacteristic(Characteristic.SerialNumber, "RTCTMP1")
            .setCharacteristic(Characteristic.FirmwareRevision, packageJSON.version);

        const temperatureService = new Service.TemperatureSensor(that.name);
        const temperatureCharacteristic = temperatureService.getCharacteristic(Characteristic.CurrentTemperature);

        function readTemperature() {
            const rawValue = fs.readFileSync(that.sourceFile, "utf-8");
			const temperature = parseFloat(rawValue) / that.divisor;
			that.log.debug(that.sourceFile + ": " + rawValue + " / " + that.divisor + " = " + temperature + "°C");
            return temperature;
        }
        temperatureCharacteristic.updateValue(readTemperature());
		setInterval(() => {
			temperatureCharacteristic.updateValue(readTemperature());
		}, that.updateInterval);
        temperatureCharacteristic.on('get', (callback) => {
            callback(null, readTemperature());
        });

        return [informationService, temperatureService];
    }
};
