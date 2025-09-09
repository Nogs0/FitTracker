import { Accelerometer, Gyroscope, Magnetometer, Barometer } from "expo-sensors";
import RNFS from "react-native-fs";
import { JsonBluetooth } from "./BluetoothServerService";
import { PermissionsAndroid } from "react-native";
class SensorLoggerService {
  private fileUri = "";
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
  private contadorDeRegistrosAcelerometro = -1;
  private contadorDeRegistrosGiroscopio = -1;
  private basePath = RNFS.DocumentDirectoryPath;
  private buffers: Record<string, string[]> = {};
  private timer: number | null = null;
  private prefixoArquivo = "";

  public async requestStoragePermission() {
    try {
      const grantedRead = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        {
          title: 'Permissão de acesso',
          message: 'O app precisa acessar seus arquivos para abrir o CSV.',
          buttonNeutral: 'Perguntar depois',
          buttonNegative: 'Cancelar',
          buttonPositive: 'OK',
        },
      );

      const grantedWrite = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        {
          title: "Permissão de Armazenamento",
          message: "O app precisa salvar arquivos no armazenamento externo.",
          buttonNeutral: "Perguntar depois",
          buttonNegative: "Cancelar",
          buttonPositive: "OK",
        }
      );

      const grantedSensor = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.BODY_SENSORS,
        {
          title: "Permissão de Utilização de Sensores",
          message: "O app precisa utilizar sensores específicos para o pleno funcionamento.",
          buttonNeutral: "Perguntar depois",
          buttonNegative: "Cancelar",
          buttonPositive: "OK",
        }
      );

      if (grantedWrite !== PermissionsAndroid.RESULTS.GRANTED) {
        throw new Error("Permissão para escrita é obrigatória!");
      }

      if (grantedRead !== PermissionsAndroid.RESULTS.GRANTED) {
        throw new Error("Permissão para leitura é obrigatória!");
      }

      if (grantedSensor !== PermissionsAndroid.RESULTS.GRANTED) {
        throw new Error("Permissão para sensores é obrigatória!");
      }

      return grantedWrite === PermissionsAndroid.RESULTS.GRANTED &&
        grantedRead === PermissionsAndroid.RESULTS.GRANTED &&
        grantedSensor === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn(err);
      return false;
    }
  }

  public async startLogging(dados: JsonBluetooth, onStart?: () => void) {
    this.contadorDeRegistrosAcelerometro = -1;
    this.contadorDeRegistrosGiroscopio = -1;
    const dataAtual = Date.now().toString();
    this.prefixoArquivo = `${dataAtual}${dados.nomeUsuario}${dados.nomeAtividade}`;
    await this.createFile(`${this.prefixoArquivo}_accelerometer`, "timestamp,ax,ay,az," + dados.frequenciaAcelerometro + "Hz");
    await this.createFile(`${this.prefixoArquivo}_gyroscope`, "timestamp,gx,gy,gz," + dados.frequenciaGiroscopio + "Hz");
    await this.createFile(`${this.prefixoArquivo}_magnetometer`, "timestamp,mx,my,mz," + dados.frequenciaMagnetometro + "Hz");
    await this.createFile(`${this.prefixoArquivo}_barometer`, "timestamp,pressure," + dados.frequenciaBarometro + "Hz");

    if (dados.frequenciaAcelerometro) {
      let taxaASerUtilizada = this.conversorHzEmMs(dados.frequenciaAcelerometro);
      if (taxaASerUtilizada < 12 && taxaASerUtilizada > 5)
        taxaASerUtilizada = 5;
      else
        taxaASerUtilizada = 1; //Obriga o limite do android
      Accelerometer.setUpdateInterval(taxaASerUtilizada);
      this.subscriptions.push(
        Accelerometer.addListener(({ x, y, z }) => {
          this.contadorDeRegistrosAcelerometro++;
          this.buffers[`${this.prefixoArquivo}_accelerometer`].push(
            `${Date.now()},${x},${y},${z}\n`
          );
        })
      );
    }

    if (dados.frequenciaGiroscopio) {
      let taxaASerUtilizada = this.conversorHzEmMs(dados.frequenciaGiroscopio);
      if (taxaASerUtilizada < 12 && taxaASerUtilizada > 5)
        taxaASerUtilizada = 5;
      else
        taxaASerUtilizada = 1; //Obriga o limite do android
      Gyroscope.setUpdateInterval(taxaASerUtilizada);
      this.subscriptions.push(
        Gyroscope.addListener(({ x, y, z }) => {
          this.contadorDeRegistrosGiroscopio++;
          this.buffers[`${this.prefixoArquivo}_gyroscope`].push(
            `${Date.now()},${x},${y},${z}\n`
          );
        })
      );
    }

    if (dados.frequenciaMagnetometro) {
      let taxaASerUtilizada = this.conversorHzEmMs(dados.frequenciaMagnetometro);
      if (taxaASerUtilizada < 12 && taxaASerUtilizada > 5)
        taxaASerUtilizada = 5;
      else
        taxaASerUtilizada = 1; //Obriga o limite do android
      Magnetometer.setUpdateInterval(taxaASerUtilizada);
      this.subscriptions.push(
        Magnetometer.addListener(({ x, y, z }) => {
          this.buffers[`${this.prefixoArquivo}_magnetometer`].push(
            `${Date.now()},${x},${y},${z}\n`
          );
        })
      );
    }

    if (dados.frequenciaBarometro) {
      let taxaASerUtilizada = this.conversorHzEmMs(dados.frequenciaBarometro);
      if (taxaASerUtilizada < 12 && taxaASerUtilizada > 5)
        taxaASerUtilizada = 5;
      else
        taxaASerUtilizada = 1; //Obriga o limite do android
      Barometer.setUpdateInterval(taxaASerUtilizada);
      this.subscriptions.push(
        Barometer.addListener(({ pressure }) => {
          this.buffers[`${this.prefixoArquivo}_barometer`].push(
            `${Date.now()},${pressure}\n`
          );
        })
      );
    }

    this.timer = setInterval(async () => {
      for (const [fileName, data] of Object.entries(this.buffers)) {
        if (data.length > 0) {
          const chunk = data.join("");
          this.buffers[fileName] = [];
          await RNFS.appendFile(`${this.basePath}/${fileName}.csv`, chunk, "utf8")
            .catch(err => console.log("Erro ao escrever:", err));
        }
      }
    }, 200);

    onStart?.();
  }

  private async createFile(name: string, header: string) {
    const filePath = `${this.basePath}/${name}.csv`;
    await RNFS.writeFile(filePath, header + "\n", "utf8");
    this.buffers[name] = [];
    return filePath;
  }

  private conversorHzEmMs(hertz: number) {
    return Math.round(1000 / hertz);
  }

  public async stopLogging(onStop?: (prefixo: string) => void) {
    // Salvar qualquer dado residual antes de encerrar
    for (const [fileName, data] of Object.entries(this.buffers)) {
      if (data.length > 0) {
        const chunk = data.join("");
        this.buffers[fileName] = [];
        await RNFS.appendFile(`${this.basePath}/${fileName}.csv`, chunk, "utf8")
          .catch(err => console.log("Erro ao salvar residual:", err));
      }
    }

    // Cancelar listeners
    this.subscriptions.forEach(s => s.remove());
    this.subscriptions = [];

    // Cancelar timer
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }

    console.log('Acelerômetro: ', this.contadorDeRegistrosAcelerometro);
    console.log('Giroscópio: ', this.contadorDeRegistrosGiroscopio);
    onStop?.(this.prefixoArquivo);
  }
}

export default new SensorLoggerService();