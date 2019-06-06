
//% weight=10 color=#CA8EFF icon="\uf013" block="testbit"

namespace HaodaBit {



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

    export enum ssd {
        S0 = DigitalPin.P0,
        S1 = DigitalPin.P1,
        S2 = DigitalPin.P2,
        S8 = DigitalPin.P8,
        S12 = DigitalPin.P12,
        S16 = DigitalPin.P16
    }

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
    export function Ultrasonic(pin: DigitalPin): number {

        // send pulse

        pins.setPull(pin, PinPullMode.PullNone);
        pins.digitalWritePin(pin, 0);
        control.waitMicros(2);
        pins.digitalWritePin(pin, 1);
        control.waitMicros(10);
        pins.digitalWritePin(pin, 0);

        // read pulse
        let d = pins.pulseIn(pin, PulseValue.High, 25000);
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
    export function servo(pin: AnalogPin, degree: number): void {

        let value = (0.5 + degree/90)*1000 // 0.6ms ~ 2.4ms
        
        pins.servoSetPulse(pin, value)
    }

    //% blockId=setRGB block="初始化RGB共|%dnum|个在|%pin"
    //% weight=100
    export function DRGB(Dnum: number, pin: AnalogPin): void {



    }


}
