
//% weight=10 color=#CA8EFF icon="\uf013" block="testbit"
//% groups='["Ultrasonic/Mic", "Linefollower", "Environment", "Actuator", "Mp3", "RGB"]'
namespace HaodaBit {



    const PortDigital = [
        DigitalPin.P0,
        DigitalPin.P1,
        DigitalPin.P2,
        DigitalPin.P8,
        DigitalPin.P12,
        DigitalPin.P16
    ]

    const PortAnalog = [
        AnalogPin.P0,
        AnalogPin.P1,
        AnalogPin.P2,
        AnalogPin.P8,
        AnalogPin.P12,
        AnalogPin.P16
    ]

    export enum Ports {
        P0 = 0,
        P1 = 1,
        P2 = 2,
        P8 = 3,
        P12 = 4,
        P16 = 5
    }

    export enum DHT11Type {
        //% block=temperature(°C)
        TemperatureC = 0,
        //% block=temperature(°F)
        TemperatureF = 1,
        //% block=humidity
        Humidity = 2
    }

    //% shim=powerbrick::dht11Update
    function dht11Update(pin: number): number {
        return 999;
    }

    /**
 * Well known colors for a NeoPixel strip
 */
    export enum HaodaBitColors {
        //% block=red
        Red = 0xFF0000,
        //% block=orange
        Orange = 0xFFA500,
        //% block=yellow
        Yellow = 0xFFFF00,
        //% block=green
        Green = 0x00FF00,
        //% block=blue
        Blue = 0x0000FF,
        //% block=indigo
        Indigo = 0x4b0082,
        //% block=violet
        Violet = 0x8a2be2,
        //% block=purple
        Purple = 0xFF00FF,
        //% block=white
        White = 0xFFFFFF,
        //% block=black
        Black = 0x000000
    }

    let dht11Temp = -1;
    let dht11Humi = -1;


    export enum Motors {
        //%blockId=HaodaBit_motordriver_motor_one
        //% block="MA"
        Motor1,
        //%blockId=HaodaBit_motordriver_motor_two
        //% block="MB"
        Motor2
    }

    let distanceBuf = 0;

    /**
    * The user can select the 8 steering gear controller.
    */




    function i2cwrite(addr: number, reg: number, value: number) {
        let buf = pins.createBuffer(2)
        buf[0] = reg
        buf[1] = value
        pins.i2cWriteBuffer(addr, buf)
    }
    /**
     * Runs the motor at the given speed
     */
    //% block="电机 %motor|速度 %speed"
    //% speed.min=-100 speed.max=100
    //% group="Actuator" name.fieldEditor="gridpicker" name.fieldOptions.columns=4
    export function MotorRun(motor: Motors, speed: number) {
        switch (motor) {
            case Motors.Motor1:
                i2cwrite(11, 0, speed);

                break;
            case Motors.Motor2:
                i2cwrite(11, 2, speed);

                break;
        }
    }

    //% blockId=funbit_ultrasonic block="超声波|管脚 %pin"
    //% weight=10
    //% group="Ultrasonic/Mic" blockGap=50
    export function Ultrasonic(pin: Ports): number {

        // send pulse
        let port = PortDigital[pin]

        pins.setPull(port, PinPullMode.PullNone);
        pins.digitalWritePin(port, 0);
        control.waitMicros(2);
        pins.digitalWritePin(port, 1);
        control.waitMicros(10);
        pins.digitalWritePin(port, 0);

        // read pulse
        let d = pins.pulseIn(port, PulseValue.High, 25000);
        let ret = d;
        // filter timeout spikes
        if (ret == 0 && distanceBuf != 0) {
            ret = distanceBuf;
        }
        distanceBuf = d;
        return Math.floor(ret * 10 / 6 / 58);
    }
    //% blockId=motor_servo block="舵机|%pin|转动角度|%degree"
    //% weight=100
    //% degree.min=0 degree.max=180
    //% group="Actuator" name.fieldEditor="gridpicker" name.fieldOptions.columns=4
    export function servo(pin: Ports, degree: number): void {

        let port = PortAnalog[pin]

        let value = (0.5 + degree / 90) * 1000
        pins.servoSetPulse(port, value)
    }

    //% blockId=powerbrick_dht11 block="DHT11|port %port|type %readtype"
    //% weight=60
    //% group="Environment" blockGap=50
    export function DHT11(port: Ports, readtype: DHT11Type): number {
        let pin = PortDigital[port]

        // todo: get pinname in ts
        let value = (dht11Update(pin - 7) >> 0)

        if (value != 0) {
            dht11Temp = (value & 0x0000ff00) >> 8;
            dht11Humi = value >> 24;
        }
        if (readtype == DHT11Type.TemperatureC) {
            return dht11Temp;
        } else if (readtype == DHT11Type.TemperatureF) {
            return Math.floor(dht11Temp * 9 / 5) + 32;
        } else {
            return dht11Humi;
        }
    }


}

