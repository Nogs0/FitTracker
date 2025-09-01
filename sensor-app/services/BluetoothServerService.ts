import { PermissionsAndroid, Platform } from "react-native";
import RNBluetoothClassic, {
  BluetoothDevice,
  BluetoothEventSubscription,
} from "react-native-bluetooth-classic";

type ListenerCallback = (data: string) => void;

class BluetoothServerService {
  private connectedDevice: BluetoothDevice | null = null;
  private dataListener: BluetoothEventSubscription | null = null;

  public async requestBluetoothPermission() {
    if (Platform.OS !== 'android') {
      return true; // Se não for Android, não faz nada
    }

    // Para Android 12 (API 31) ou superior
    if (Platform.Version >= 31) {
      try {
        const permissions = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        ]);

        const isScanGranted = permissions['android.permission.BLUETOOTH_SCAN'] === PermissionsAndroid.RESULTS.GRANTED;
        const isConnectGranted = permissions['android.permission.BLUETOOTH_CONNECT'] === PermissionsAndroid.RESULTS.GRANTED;

        if (isScanGranted && isConnectGranted) {
          console.log('Permissões de Bluetooth para Android 12+ concedidas.');
          return true;
        } else {
          console.log('Uma ou mais permissões de Bluetooth para Android 12+ foram negadas.');
          return false;
        }
      } catch (err) {
        console.warn(err);
        return false;
      }
    }

    // Para Android 11 (API 30) ou inferior
    // A permissão de localização é suficiente
    else {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Permissão de Localização',
            message: 'Este aplicativo precisa de acesso à sua localização para encontrar dispositivos Bluetooth próximos.',
            buttonNegative: 'Cancelar',
            buttonPositive: 'OK',
          }
        );

        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          console.log('Permissão de Localização (para Bluetooth) concedida.');
          return true;
        } else {
          console.log('Permissão de Localização (para Bluetooth) negada.');
          return false;
        }
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
  }

  public async getStatusServer() {
    return await RNBluetoothClassic.isBluetoothEnabled();
  }
  /**
   * Inicia o servidor e aguarda conexões
   */
  public async startServer(
    onConnected?: (device: BluetoothDevice) => void,
    onMessage?: ListenerCallback
  ): Promise<void> {
    try {

      await this.requestBluetoothPermission();
      const device = await RNBluetoothClassic.accept({ delimiter: "\n" });
      this.connectedDevice = device;

      console.log("Cliente conectado:", device.name, device.address);

      if (onConnected) onConnected(device);

      // Ouvindo mensagens recebidas
      this.dataListener = device.onDataReceived((event) => {
        if (onMessage) onMessage(event.data);
      });
    } catch (err) {
      console.error("Erro ao iniciar servidor Bluetooth:", err);
      throw err;
    }
  }

  /**
   * Envia mensagem ao cliente conectado
   */
  public async sendMessage(message: string): Promise<void> {
    if (!this.connectedDevice) {
      throw new Error("Nenhum cliente conectado.");
    }
    await this.connectedDevice.write(message + "\n");
    console.log("Mensagem enviada:", message);
  }

  /**
   * Desconecta e limpa os listeners
   */
  public async stopServer(): Promise<void> {

    await RNBluetoothClassic.cancelAccept();

    if (this.dataListener) {
      this.dataListener.remove();
      this.dataListener = null;
    }

    if (this.connectedDevice) {
      try {
        await this.connectedDevice.disconnect();
        console.log("Cliente desconectado.");
      } catch {
      }
      this.connectedDevice = null;
    }
  }
}

export default new BluetoothServerService();
