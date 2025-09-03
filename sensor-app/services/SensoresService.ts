import { Accelerometer, Gyroscope, Magnetometer, Barometer } from "expo-sensors";
import RNFS from "react-native-fs";
import BluetoothServerService, { JsonBluetooth } from "./BluetoothServerService";
import { PermissionsAndroid } from "react-native";

class SensorLoggerService {
  private fileUri = RNFS.DownloadDirectoryPath + "/";
  private subscriptions: any[] = [];
  private buffer: string[] = [];
  private intervalRef: any = null;
  private latestData = {
    ax: 0, ay: 0, az: 0,
    gx: 0, gy: 0, gz: 0,
    mx: 0, my: 0, mz: 0,
    barometer: 0,
  };
  private contadorDeRegistros = -1;

  public async requestStoragePermission() {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        {
          title: "Permissão de Armazenamento",
          message: "O app precisa salvar arquivos no armazenamento externo.",
          buttonNeutral: "Perguntar depois",
          buttonNegative: "Cancelar",
          buttonPositive: "OK",
        }
      );
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        throw new Error("Permissão é obrigatória!");
      }

      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn(err);
      return false;
    }
  }

  public async startLogging(dados: JsonBluetooth, onStart?: () => void) {
    const fileName = this.fileUri + dados.nomeUsuario + dados.nomeAtividade + dados.frequenciaHertz + "Hz.csv";

    await RNFS.writeFile(
      fileName,
      "timestamp,ax,ay,az,gx,gy,gz,mx,my,mz,barometer\n",
      "utf8"
    ).catch(err => console.log("Erro ao criar CSV:", err));

    // Ajusta a taxa de atualização
    Accelerometer.setUpdateInterval(dados.frequenciaMilissegundos);
    Gyroscope.setUpdateInterval(dados.frequenciaMilissegundos);
    Magnetometer.setUpdateInterval(dados.frequenciaMilissegundos);
    Barometer.setUpdateInterval(dados.frequenciaMilissegundos);

    // Adiciona listeners
    this.subscriptions = [
      Accelerometer.addListener(({ x, y, z }) => {
        this.latestData.ax = x;
        this.latestData.ay = y;
        this.latestData.az = z;
      }),
      Gyroscope.addListener(({ x, y, z }) => {
        this.latestData.gx = x;
        this.latestData.gy = y;
        this.latestData.gz = z;
      }),
      Magnetometer.addListener(({ x, y, z }) => {
        this.latestData.mx = x;
        this.latestData.my = y;
        this.latestData.mz = z;
      }),
      Barometer.addListener(({ pressure }) => {
        this.latestData.barometer = pressure;
      }),
    ];

    // Timer para gravação periódica
    this.intervalRef = setInterval(async () => {
      const d = this.latestData;
      const timestamp = Date.now();
      const line = `${timestamp},${d.ax},${d.ay},${d.az},${d.gx},${d.gy},${d.gz},${d.mx},${d.my},${d.mz},${d.barometer}\n`;
      this.buffer.push(line);
      this.contadorDeRegistros += this.buffer.length;
      if (this.buffer.length >= 100) {
        const dataToWrite = this.buffer.join("");
        this.buffer = [];
        await RNFS.appendFile(fileName, dataToWrite, "utf8")
          .catch(err => console.log("Erro ao escrever CSV:", err));
      }
    }, 100);

    onStart?.();
  }

  public async stopLogging(nomeUsuario: string, nomeAtividade: string, frequenciaHertz: number, onStop?: (qtdRegistros: number) => void) {
    this.intervalRef && clearInterval(this.intervalRef);

    // Cancela listeners
    this.subscriptions.forEach((s) => s.remove());
    this.subscriptions = [];

    // Salva dados restantes
    this.contadorDeRegistros += this.buffer.length;
    if (this.buffer.length > 0) {
      const dataToWrite = this.buffer.join("");
      this.buffer = [];
      await RNFS.appendFile(this.fileUri + nomeUsuario + nomeAtividade + frequenciaHertz + "Hz.csv", dataToWrite, "utf8")
        .catch(err => console.log("Erro ao finalizar CSV:", err));
    }

    onStop?.(this.contadorDeRegistros);
  }
}

export default new SensorLoggerService();
