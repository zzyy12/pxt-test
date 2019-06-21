#include "pxt.h"
#include <map>
#include <vector>
#include "ReceiverIR.h"
using namespace pxt;
typedef vector<Action> vA;

enum class Pins{
  P0=  3,
  P1=  2,
  P2=  1,
  P8=  18,
  P12= 20,
  P16= 16
};

enum class RemoteButton {
        IR_BUTTON_0 = 0x4f,
        IR_BUTTON_1 = 0xff,
        IR_BUTTON_2 = 0x7f,
        IR_BUTTON_3 = 0xbf,
        IR_BUTTON_4 = 0xdf,
        IR_BUTTON_5 = 0x5f,
        IR_BUTTON_6 = 0x9f,
        IR_BUTTON_7 = 0xef,
        IR_BUTTON_8 = 0x6f,
        IR_BUTTON_9 = 0xaf,
        IR_BUTTON_OK = 0x57,
        IR_BUTTON_UP = 0x77,
        IR_BUTTON_DOWN = 0x67,
        IR_BUTTON_LEFT = 0xd7,
        IR_BUTTON_RIGHT = 0x97,
        IR_BUTTON_SPARK = 0xcf,
        IR_BUTTON_POUND = 0x8f
};

//% color=50 weight=80
//% icon="\uf1eb"
namespace Mbit_IR { 
   map<RemoteButton, vA> actions;
  map<RemoteButton, uint32_t> lastact;
  Timer tsb; 
  uint8_t buf[32];
  uint32_t now;
  ReceiverIR *rx;
  RemoteIR::Format fmt = RemoteIR::UNKNOWN;
  int msg;
  int IRcallbackNum;

  /**
  * button pushed.
  */
  //% blockId=ir_received_left_event
  //% block="on |%btn| button pressed"
  void onPressEvent(RemoteButton btn, Action body) {
    //if(actions.find(btn) == actions.end()) actions[btn] = new vector();
    IRcallbackNum=(int)btn;
    actions[btn].push_back(body);
  }

  void cA(vA runner){for(int i=0;i<runner.size();i++){runAction0(runner[i]);} }

  void onReceivable(){
    int x = rx->getData(&fmt, buf, 32 * 8);
    /*
    uBit.serial.send(".");
    uBit.serial.send(buf[0]);
    uBit.serial.send(".");
    uBit.serial.send(buf[1]);
    uBit.serial.send(".");
    uBit.serial.send(buf[2]);
    uBit.serial.send(".");
    uBit.serial.send(buf[3]);
    uBit.serial.send(".");
    uBit.serial.send(buf[4]);
    uBit.serial.send(".");
    uBit.serial.send(buf[5]);
    uBit.serial.send(".");
    uBit.serial.send(buf[6]);
    uBit.serial.send(".");
    uBit.serial.send(buf[7]);
    uBit.serial.send(".");
    uBit.serial.send(buf[8]);
    uBit.serial.send(".");
    uBit.serial.send(buf[9]);
    uBit.serial.send(".");
    uBit.serial.send(buf[10]);
    uBit.serial.send(".");
    uBit.serial.send(buf[11]);
    uBit.serial.send(".");
    uBit.serial.send(buf[12]);
    uBit.serial.send(".");
    uBit.serial.send(buf[13]);
    uBit.serial.send(".");
    uBit.serial.send(buf[14]);
    uBit.serial.send(".");
    uBit.serial.send(buf[15]);
    uBit.serial.send(".");
    uBit.serial.send(buf[16]);
    uBit.serial.send(".");
    uBit.serial.send(buf[17]);
    uBit.serial.send(".");
    uBit.serial.send(buf[18]);
    uBit.serial.send(".");
    uBit.serial.send(buf[19]);
    uBit.serial.send(".");
    uBit.serial.send(buf[20]);
    uBit.serial.send(".");
    uBit.serial.send(buf[21]);
    uBit.serial.send(".");
    uBit.serial.send(buf[22]);
    uBit.serial.send(".");
    uBit.serial.send(buf[23]);
    uBit.serial.send(".");
    uBit.serial.send(buf[24]);
    uBit.serial.send(".");
    uBit.serial.send(buf[25]);
    uBit.serial.send(".");
    uBit.serial.send(buf[26]);
    uBit.serial.send(".");
    uBit.serial.send(buf[27]);
    uBit.serial.send(".");
    uBit.serial.send(buf[28]);
    uBit.serial.send(".");
    uBit.serial.send(buf[29]);
    uBit.serial.send(".");
    uBit.serial.send(buf[30]);
    uBit.serial.send(".");
    uBit.serial.send(buf[31]);
    uBit.serial.send(".");
    uBit.serial.send(buf[32]);
    uBit.serial.send(".");
    uBit.serial.send(buf[33]);
    uBit.serial.send(".");
    uBit.serial.send(buf[34]);
    uBit.serial.send(".");
    uBit.serial.send(buf[35]);
    uBit.serial.send(".end");
    */
    //if(actions.find((RemoteButton)buf[2]) == actions.end()) return;
    now = tsb.read_ms();
    if(now - lastact[(RemoteButton)buf[2]] < 100) return;
    lastact[(RemoteButton)buf[2]] = now;
    msg=(int)buf[2];
    uBit.serial.send(IRcallbackNum);
    if(IRcallbackNum < 1){
      return;
    }
    for(int i=1;i<=IRcallbackNum;i++){
      cA(actions[(RemoteButton)i]);  
    }    
  }

  void monitorIR(){
    while(1){
      while(rx->getState() != ReceiverIR::Received){ 
        uBit.sleep(50);
      }
      onReceivable();
    }
  }

  /**
  * initialises local variablesssss
  */
  //% blockId=ir_init
  //% block="connect ir receiver to %pin"
  void initIR(Pins pin){
    rx = new ReceiverIR((PinName)pin);
    tsb.start(); //interrupt timer for debounce
    create_fiber(monitorIR);
  }
  //% 
  int getParam(){
    return msg;
  }
}
