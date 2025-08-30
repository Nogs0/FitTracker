import RNBluetoothClassic, {
  BluetoothDevice,
  BluetoothEventSubscription,
} from "react-native-bluetooth-classic";

type ListenerCallback = (data: string) => void;

class BluetoothServerService {
  private connectedDevice: BluetoothDevice | null = null;
  private dataListener: BluetoothEventSubscription | null = null;

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
      if (await this.getStatusServer()){
        return;
      }
      const device = await RNBluetoothClassic.accept({ delimiter: "\n" });
      this.connectedDevice = device;

      console.log("Cliente conectado:", device.name, device.address);

      if (onConnected) onConnected(device);

      // Ouvindo mensagens recebidas
      this.dataListener = device.onDataReceived((event) => {
        console.log("Mensagem recebida:", event.data);
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
    if (this.dataListener) {
      this.dataListener.remove();
      this.dataListener = null;
    }

    if (this.connectedDevice) {
      try {
        await this.connectedDevice.disconnect();
        console.log("Cliente desconectado.");
      } catch (err) {
        console.error("Erro ao desconectar:", err);
      }
      this.connectedDevice = null;
    }
  }
}

export default new BluetoothServerService();
