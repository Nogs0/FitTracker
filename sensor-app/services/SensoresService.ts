import { Accelerometer, Gyroscope, Magnetometer, Barometer } from "expo-sensors";
import RNFS from "react-native-fs";

type ColetaData = {
  nomeUsuario: string;
  nomeAtividade: string;
  frequencia: number;
};

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

  public async startLogging(dados: ColetaData, onStart?: () => void) {
    const fileName = this.fileUri + dados.nomeUsuario + dados.nomeAtividade + ".csv";
    
    await RNFS.writeFile(
      fileName,
      "timestamp,ax,ay,az,gx,gy,gz,mx,my,mz,barometer\n",
      "utf8"
    ).catch(err => console.log("Erro ao criar CSV:", err));

    // Ajusta a taxa de atualização
    Accelerometer.setUpdateInterval(dados.frequencia);
    Gyroscope.setUpdateInterval(dados.frequencia);
    Magnetometer.setUpdateInterval(dados.frequencia);
    Barometer.setUpdateInterval(dados.frequencia);

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

      if (this.buffer.length >= 100) {
        const dataToWrite = this.buffer.join("");
        this.buffer = [];
        await RNFS.appendFile(fileName, dataToWrite, "utf8")
          .catch(err => console.log("Erro ao escrever CSV:", err));
      }
    }, 100);

    onStart?.();
  }

  public async stopLogging(nomeUsuario: string, nomeAtividade: string, onStop?: () => void) {
    this.intervalRef && clearInterval(this.intervalRef);

    // Cancela listeners
    this.subscriptions.forEach((s) => s.remove());
    this.subscriptions = [];

    // Salva dados restantes
    if (this.buffer.length > 0) {
      const dataToWrite = this.buffer.join("");
      this.buffer = [];
      await RNFS.appendFile(this.fileUri + nomeUsuario + nomeAtividade + ".csv", dataToWrite, "utf8")
        .catch(err => console.log("Erro ao finalizar CSV:", err));
    }

    onStop?.();
  }
}

export default new SensorLoggerService();
