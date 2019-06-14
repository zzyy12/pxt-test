
/*
Riven
Microbit powerbrick extension board
load dependency
"powerbrick": "file:../pxt-powerbrick"
dht11 port from MonadnockSystems/pxt-dht11
rgb pixel port from Microsoft/pxt-neopixel
*/

//% weight=10 color=#CA8EFF icon="\uf013" block="testbit"
//% groups='["Ultrasonic/Mic", "Linefollower", "Environment", "Actuator", "Mp3", "RGB"]'
namespace HaodaBit {

    const MM32_ADDRESS = 0x40
    const MODE1 = 0x00
    const MODE2 = 0x01
    const SUBADR1 = 0x02
    const SUBADR2 = 0x03
    const SUBADR3 = 0x04
    const PRESCALE = 0xFE
    const LED0_ON_L = 0x06
    const LED0_ON_H = 0x07
    const LED0_OFF_L = 0x08
    const LED0_OFF_H = 0x09
    const ALL_LED_ON_L = 0xFA
    const ALL_LED_ON_H = 0xFB
    const ALL_LED_OFF_L = 0xFC
    const ALL_LED_OFF_H = 0xFD

    const STP_CHA_L = 2047
    const STP_CHA_H = 4095

    const STP_CHB_L = 1
    const STP_CHB_H = 2047

    const STP_CHC_L = 1023
    const STP_CHC_H = 3071

    const STP_CHD_L = 3071
    const STP_CHD_H = 1023


    const BYG_CHA_L = 3071
    const BYG_CHA_H = 1023

    const BYG_CHB_L = 1023
    const BYG_CHB_H = 3071

    const BYG_CHC_L = 4095
    const BYG_CHC_H = 2047

    const BYG_CHD_L = 2047
    const BYG_CHD_H = 4095

    const TCS34725_COMMAND_BIT = 0x80
    const TCS34725_ADDRESS = 0x52
    const TCS34725_ENABLE = 0x00
    const TCS34725_ATIME = 0x01
    const TCS34725_WTIME = 0x03
    const TCS34725_AILTL = 0x04
    const TCS34725_AILTH = 0x05
    const TCS34725_AIHTL = 0x06
    const TCS34725_AIHTH = 0x07
    const TCS34725_PERS = 0x0C
    const TCS34725_CONFIG = 0x0D
    const TCS34725_CONTROL = 0x0F
    const TCS34725_ID = 0x12
    const TCS34725_STATUS = 0x13
    const TCS34725_CDATAL = 0x14
    const TCS34725_CDATAH = 0x15
    const TCS34725_RDATAL = 0x16
    const TCS34725_RDATAH = 0x17
    const TCS34725_GDATAL = 0x18
    const TCS34725_GDATAH = 0x19
    const TCS34725_BDATAL = 0x1A
    const TCS34725_BDATAH = 0x1B



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

    const PortSerial = [
        SerialPin.P0,
        SerialPin.P1,
        SerialPin.P2,
        SerialPin.P8,
        SerialPin.P12,
        SerialPin.P16
    ]

    export enum Ports {
        P0 = 0,
        P1 = 1,
        P2 = 2,
        P8 = 3,
        P12 = 4,
        P16 = 5,

    }

    export enum Ports1 {
        P0 = 0,
        P1 = 1,
        P2 = 2


    }



    export enum DHT11Type {
        //% block=温度(°C)
        TemperatureC = 0,
        //% block=温度(°F)
        TemperatureF = 1,
        //% block=湿度
        Humidity = 2
    }

    export enum PrevNext {
        //% block=播放
        play = 0x0d,
        //% block=停止
        stop = 0x0e,
        //% block=下一首
        next = 0x01,
        //% block=上一首
        prev = 0x02
    }

    export enum Dir {
        //% blockId="CW" block="正转"
        CW = 1,
        //% blockId="CCW" block="反转"
        CCW = -1,
    }

    export enum BBLineSensor {
        //% block="左侧"
        Left,
        //% block="右侧"
        Right
    }


    export enum Creadcolor {
        //% block=R值
        RR = 0,
        //% block=G值
        GG = 1,
        //% block=B值
        BB = 2
    }

    //% shim=powerbrick::dht11Update
    function dht11Update(pin: number): number {
        return 999;
    }

    /**
 * Well known colors for a NeoPixel strip
 */


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
    let initialized = false
    let tcs34725Initialised = false

    function i2cWrite(addr: number, reg: number, value: number) {
        let buf = pins.createBuffer(2)
        buf[0] = reg
        buf[1] = value
        pins.i2cWriteBuffer(addr, buf)
    }

    function i2cCmd(addr: number, value: number) {
        let buf = pins.createBuffer(1)
        buf[0] = value
        pins.i2cWriteBuffer(addr, buf)
    }

    function i2cRead(addr: number, reg: number) {
        pins.i2cWriteNumber(addr, reg, NumberFormat.UInt8BE);
        let val = pins.i2cReadNumber(addr, NumberFormat.UInt8BE);
        return val;
    }

    function MM32DDDD(): void {
        i2cWrite(MM32_ADDRESS, MODE1, 0x00)
        setFreq(50);
        initialized = true
    }



    function setFreq(freq: number): void {
        // Constrain the frequency
        let prescaleval = 25000000;
        prescaleval /= 4096;
        prescaleval /= freq;
        prescaleval -= 1;
        let prescale = prescaleval;//Math.floor(prescaleval + 0.5);
        let oldmode = i2cRead(MM32_ADDRESS, MODE1);
        let newmode = (oldmode & 0x7F) | 0x10; // sleep
        i2cWrite(MM32_ADDRESS, MODE1, newmode); // go to sleep
        i2cWrite(MM32_ADDRESS, PRESCALE, prescale); // set the prescaler
        i2cWrite(MM32_ADDRESS, MODE1, oldmode);
        control.waitMicros(5000);
        i2cWrite(MM32_ADDRESS, MODE1, oldmode | 0xa1);
    }

    function setPwm(channel: number, on: number, off: number): void {
        if (channel < 0 || channel > 15)
            return;

        let buf = pins.createBuffer(5);
        buf[0] = LED0_ON_L + 4 * channel;
        buf[1] = on & 0xff;
        buf[2] = (on >> 8) & 0xff;
        buf[3] = off & 0xff;
        buf[4] = (off >> 8) & 0xff;
        pins.i2cWriteBuffer(MM32_ADDRESS, buf);
    }

    /**
     * Runs the motor at the given speed
     */
    ///% weight=90
    //% blockId=HaodaBit_MotorRun block="电机|%index|dir|%Dir|speed|%speed"
    //% speed.min=0 speed.max=255
    //% index.fieldEditor="gridpicker" index.fieldOptions.columns=2
    //% direction.fieldEditor="gridpicker" direction.fieldOptions.columns=2
    //% group="Actuator" name.fieldEditor="gridpicker" name.fieldOptions.columns=4
    export function MotorRun(index: Motors, direction: Dir, speed: number): void {
        if (!initialized) {
            MM32DDDD()
        }
        speed = speed * 16 * direction; // map 255 to 4096
        if (speed >= 4096) {
            speed = 4095
        }
        if (speed <= -4096) {
            speed = -4095
        }
        if (index > 4 || index <= 0)
            return
        let pn = (4 - index) * 2
        let pp = (4 - index) * 2 + 1
        if (speed >= 0) {
            setPwm(pp, 0, speed)
            setPwm(pn, 0, 0)
        } else {
            setPwm(pp, 0, 0)
            setPwm(pn, 0, -speed)
        }
    }

    //% weight=20
    //% blockId=HaodaBit_motorStop block="电机停止|%index"
    //% index.fieldEditor="gridpicker" index.fieldOptions.columns=2 
    //% group="Actuator" name.fieldEditor="gridpicker" name.fieldOptions.columns=4
    export function motorStop(index: Motors) {
        setPwm((4 - index) * 2, 0, 0);
        setPwm((4 - index) * 2 + 1, 0, 0);
    }

    //% blockId=HaodaBit_ultrasonic block="超声波|管脚 %pin"
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
    //% blockId=HaodaBit_motor_servo block="舵机|%pin|转动角度|%degree"
    //% weight=100
    //% degree.min=0 degree.max=180
    //% group="Actuator" name.fieldEditor="gridpicker" name.fieldOptions.columns=4
    export function servo(pin: Ports, degree: number): void {

        let port = PortAnalog[pin]

        let value = (0.5 + degree / 90) * 1000
        pins.servoSetPulse(port, value)
    }

    //% blockId=HaodaBit_LM35_server block="读取LM35温度在|%pin"
    //% weight=100
    //% group="Environment" blockGap=50
    export function server_lm35(pin: Ports1): number {

        let port = PortAnalog[pin]
        let vas = pins.analogReadPin(port)
        let value = (82.5 * vas) >> 8
        return value;
    }

    //% blockId=HaodaBit_dht11 block="读 DHT11| %readtype|在 %port"
    //% weight=60
    //% group="Environment" blockGap=50
    export function DHT11(readtype: DHT11Type, port: Ports1): number {

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

    function calcSum(buf: Buffer, start: number, end: number): number {
        let sum = 0;
        for (let i = start; i <= end; i++) {
            sum += buf[i];
        }
        return sum;
    }

    //% blockId=HaodaBit_mp3_connect block="MP3 初始化|在 %port"
    //% group="MP3" weight=39
    export function MP3Connect(port: Ports): void {
        let pin = PortSerial[port]
        // todo: fiber may freeze on steam reading
        serial.redirect(pin, SerialPin.P16, BaudRate.BaudRate9600)
    }

    //% blockId=HaodaBit_mp3_play block="MP3 |%pn"
    //% group="MP3" weight=38
    export function MP3Play(pn: PrevNext): void {
        let buf = pins.createBuffer(8);
        buf[0] = 0x7e;
        buf[1] = 0xFF;
        buf[2] = 0X06;
        buf[3] = pn;
        buf[4] = 0x00;
        buf[5] = 0x00;
        buf[6] = 0x00;
        buf[7] = 0xef;
        serial.writeBuffer(buf)
    }

    //% blockId=HaodaBit_mp3_volumn block="MP3 播放音量|%volumn"
    //% volumn.min=0 volumn.max=30
    //% name.fieldEditor="gridpicker" name.fieldOptions.columns=4
    //% group="MP3" weight=37
    export function MP3Volumn(volumn: number): void {
        let buf = pins.createBuffer(8);
        buf[0] = 0x7e;
        buf[1] = 0xff;
        buf[2] = 0x06;
        buf[3] = 0x06;
        buf[4] = 0x00;
        buf[5] = 0x00;
        buf[6] = volumn;
        buf[7] = 0xef;
        serial.writeBuffer(buf)
    }

    //% blockId=HaodaBit_mp3_playindex block="MP3 播放曲目|%index"
    //% group="MP3" weight=37
    export function MP3PlayIndex(index: number): void {
        let buf = pins.createBuffer(8);
        if (index == 0) {
            index = 1;
        }
        buf[0] = 0x7e;
        buf[1] = 0xff;
        buf[2] = 0x06;
        buf[3] = 0x12;
        buf[4] = 0x00;
        buf[5] = 0x00;
        buf[6] = index;
        buf[7] = 0xef;
        serial.writeBuffer(buf)
    }

    //% blockId="HaodaBit_read_line" block="读巡线传感器在 %sensor"
    //% weight=90
    //% group="Linefollower" weight=50
    export function readLine(sensor: BBLineSensor): number {
        if (sensor == BBLineSensor.Right) {
            return pins.digitalReadPin(DigitalPin.P19);
        } else if (sensor == BBLineSensor.Left) {
            return pins.digitalReadPin(DigitalPin.P20);
        } else {
            return 0;
        }
    }


    function rgb2hue(r: number, g: number, b: number): number {
        // no float support for pxt ts
        r = r * 100 / 255;
        g = g * 100 / 255;
        b = b * 100 / 255;

        let max = Math.max(r, Math.max(g, b))
        let min = Math.min(r, Math.min(g, b))
        let c = max - min;
        let hue = 0;
        let segment = 0;
        let shift = 0;
        if (c != 0) {
            switch (max) {
                case r:
                    segment = (g - b) * 100 / c;
                    shift = 0;       // R° / (360° / hex sides)
                    if (segment < 0) {          // hue > 180, full rotation
                        shift = 360 / 60;         // R° / (360° / hex sides)
                    }
                    hue = segment + shift;
                    break;
                case g:
                    segment = (b - r) * 100 / c;
                    shift = 200;     // G° / (360° / hex sides)
                    hue = segment + shift;
                    break;
                case b:
                    segment = (r - g) * 100 / c;
                    shift = 400;     // B° / (360° / hex sides)
                    hue = segment + shift;
                    break;
            }

        }
        return hue * 60 / 100;
    }

    //% blockId=TCS34725_init block="TCS34725 初始化"
    //% weight=100
    export function Init(): void {
        i2cWrite(TCS34725_ADDRESS, TCS34725_ATIME, 252) // default inte time 4x2.78ms
        i2cWrite(TCS34725_ADDRESS, TCS34725_CONTROL, 0x03) // todo: make gain adjustable
        i2cWrite(TCS34725_ADDRESS, TCS34725_ENABLE, 0x00) // put everything off

        // power on
        i2cWrite(TCS34725_ADDRESS, TCS34725_ENABLE, 0x01) // clear all interrupt
    }



    export function ReadColor(a: number): number {
        let tmp = i2cRead(TCS34725_ADDRESS, TCS34725_STATUS) & 0x1;
        while (!tmp) {
            basic.pause(5);
            tmp = i2cRead(TCS34725_ADDRESS, TCS34725_STATUS) & 0x1;
        }
        let c = i2cRead(TCS34725_ADDRESS, TCS34725_CDATAL) + i2cRead(TCS34725_ADDRESS, TCS34725_CDATAH) * 256;
        let r = i2cRead(TCS34725_ADDRESS, TCS34725_RDATAL) + i2cRead(TCS34725_ADDRESS, TCS34725_RDATAH) * 256;
        let g = i2cRead(TCS34725_ADDRESS, TCS34725_GDATAL) + i2cRead(TCS34725_ADDRESS, TCS34725_GDATAH) * 256;
        let b = i2cRead(TCS34725_ADDRESS, TCS34725_BDATAL) + i2cRead(TCS34725_ADDRESS, TCS34725_BDATAH) * 256;
        // map to rgb based on clear channel
        //let avg = c / 3;
       // r = r * 255 / avg;
        //g = g * 255 / avg;
        //b = b * 255 / avg;
        if (a == 0) {
            return r;
        } else if (a == 1) {
            return g;
        } else if (a == 2) {
            return b;
        } else {
            return 0;
        }


    }

    //% blockId=HaodaBit_TCS34725 block="读取颜色传感器 %pn"
    //% weight=100
    //% group="Environment" blockGap=50
    export function H_TCS34725(pn: Creadcolor): number {
        let num = ReadColor(pn);
        return num;
    }
















}

