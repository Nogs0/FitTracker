import { PermissionsAndroid, Platform } from "react-native";
import RNBluetoothClassic, {
  BluetoothDevice,
  BluetoothEventSubscription,
} from "react-native-bluetooth-classic";

type ListenerCallback = (data: string) => void;

class BluetoothClientService {
  private connectedDevice: BluetoothDevice | null = null;
  private dataListener: BluetoothEventSubscription | null = null;

  public async requestBluetoothPermission(onAccept?: () => void, onReject?: () => void) {
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
          onAccept?.();
          console.log('Permissões de Bluetooth para Android 12+ concedidas.');
          return true;
        } else {
          onReject?.();
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
          onAccept?.();
          console.log('Permissão de Localização (para Bluetooth) concedida.');
          return true;
        } else {
          onReject?.();
          console.log('Permissão de Localização (para Bluetooth) negada.');
          return false;
        }
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
  }
  /**
   * Lista dispositivos pareados
   */
  public async getBondedDevices(): Promise<BluetoothDevice[]> {
    try {
      return await RNBluetoothClassic.getBondedDevices();
    } catch (err) {
      console.error("Erro ao listar dispositivos pareados:", err);
      throw err;
    }
  }

  /**
   * Conecta a um dispositivo pelo endereço
   */
  public async connectToDevice(
    address: string,
    onMessage?: ListenerCallback,
    onConnect?: () => void,
    onError?: () => void
  ): Promise<BluetoothDevice> {
    try {
      const device = await RNBluetoothClassic.connectToDevice(address);
      this.connectedDevice = device;
      onConnect?.();
      console.log("Conectado a:", device.name, device.address);

      // Listener de mensagens
      this.dataListener = device.onDataReceived((event) => {
        console.log("Mensagem recebida:", event.data);
        if (onMessage) onMessage(event.data);
      });

      return device;
    } catch (err) {
      onError?.();
      throw err;
    }
  }

  /**
   * Envia mensagem ao servidor
   */
  public async sendMessage(message: string): Promise<void> {
    if (!this.connectedDevice) {
      throw new Error("Nenhum servidor conectado.");
    }
    await this.connectedDevice.write(message + "\n");
  }

  /**
   * Desconecta e remove listeners
   */
  public async disconnect(onDisconnect?: () => void): Promise<void> {
    if (this.dataListener) {
      this.sendMessage("encerrarConexao");
      this.dataListener.remove();
      this.dataListener = null;
    }

    if (this.connectedDevice) {
      try {
        await this.connectedDevice.disconnect();
        onDisconnect?.();
        console.log("Desconectado do servidor.");
      } catch {
        
      }
      this.connectedDevice = null;
    }
  }
}

export default new BluetoothClientService();
