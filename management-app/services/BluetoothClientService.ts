import RNBluetoothClassic, {
  BluetoothDevice,
  BluetoothEventSubscription,
} from "react-native-bluetooth-classic";

type ListenerCallback = (data: string) => void;

class BluetoothClientService {
  private connectedDevice: BluetoothDevice | null = null;
  private dataListener: BluetoothEventSubscription | null = null;

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
    onMessage?: ListenerCallback
  ): Promise<BluetoothDevice> {
    try {
      const device = await RNBluetoothClassic.connectToDevice(address);
      this.connectedDevice = device;

      console.log("Conectado a:", device.name, device.address);

      // Listener de mensagens
      this.dataListener = device.onDataReceived((event) => {
        console.log("Mensagem recebida:", event.data);
        if (onMessage) onMessage(event.data);
      });

      return device;
    } catch (err) {
      console.error("Erro ao conectar:", err);
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
    console.log("Mensagem enviada:", message);
  }

  /**
   * Desconecta e remove listeners
   */
  public async disconnect(): Promise<void> {
    if (this.dataListener) {
      this.dataListener.remove();
      this.dataListener = null;
    }

    if (this.connectedDevice) {
      try {
        await this.connectedDevice.disconnect();
        console.log("Desconectado do servidor.");
      } catch (err) {
        console.error("Erro ao desconectar:", err);
      }
      this.connectedDevice = null;
    }
  }
}

export default new BluetoothClientService();
