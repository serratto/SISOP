import { Injectable } from '@angular/core';
// import { Device } from '@ionic-native/device';

@Injectable()
export class SISOPEnvironment {
    public static isAndroid(): boolean {
        return false;
        // var device = new Device();
        // return (device.isVirtual == false && device.platform.toLowerCase() == "android");
    }
    public static useSQLlite: boolean = false;
}