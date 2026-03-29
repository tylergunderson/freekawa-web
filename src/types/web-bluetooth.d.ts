interface RequestDeviceOptions {
    filters?: Array<{ name?: string; namePrefix?: string }>;
    optionalServices?: BluetoothServiceUUID[];
    acceptAllDevices?: boolean;
}

type BluetoothServiceUUID = string | number;
type BluetoothCharacteristicUUID = string | number;

interface BluetoothRemoteGATTServer {
    connected: boolean;
    connect(): Promise<BluetoothRemoteGATTServer>;
    disconnect(): void;
    getPrimaryService(
        service: BluetoothServiceUUID,
    ): Promise<BluetoothRemoteGATTService>;
}

interface BluetoothRemoteGATTService {
    getCharacteristic(
        characteristic: BluetoothCharacteristicUUID,
    ): Promise<BluetoothRemoteGATTCharacteristic>;
}

interface BluetoothRemoteGATTCharacteristic extends EventTarget {
    value: DataView | null;
    startNotifications(): Promise<BluetoothRemoteGATTCharacteristic>;
    writeValue(value: BufferSource): Promise<void>;
}

interface BluetoothDevice extends EventTarget {
    id: string;
    name?: string;
    gatt?: BluetoothRemoteGATTServer;
}

interface Bluetooth {
    requestDevice(options?: RequestDeviceOptions): Promise<BluetoothDevice>;
}

interface Navigator {
    bluetooth: Bluetooth;
}
