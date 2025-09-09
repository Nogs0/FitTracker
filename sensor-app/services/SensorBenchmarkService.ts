// SensorBenchmarkService.ts
import { Accelerometer, Gyroscope, Magnetometer, Barometer } from "expo-sensors";

type SensorKey = "accelerometer" | "gyroscope" | "magnetometer" | "barometer";

type SensorResult = {
  frequenciaAcelerometro: number,
  frequenciaGiroscopio: number,
  frequenciaMagnetometro: number,
  frequenciaBarometro: number
};

const sensorMap: Record<SensorKey, any> = {
  accelerometer: Accelerometer,
  gyroscope: Gyroscope,
  magnetometer: Magnetometer,
  barometer: Barometer,
};

class SensorBenchmarkService {
  private async medirFrequencia(sensorName: SensorKey, samples = 100): Promise<number> {
    return new Promise((resolve) => {
      const sensor = sensorMap[sensorName];
      if (!sensor) {
        resolve(0);
        return;
      }

      let last = Date.now();
      let deltas: number[] = [];
      let count = 0;

      if (!sensor) {
        console.warn(`${sensorName} não disponível`);
        resolve(0);
        return;
      }

      sensor.setUpdateInterval(1); // tenta forçar 1000Hz (~1ms)
      try {
        const sub = sensor.addListener(() => {
          const now = Date.now();
          deltas.push(now - last);
          last = now;
          count++;
          if (count >= samples) {
            sub.remove();
            // ignora o primeiro delta (pode ser muito alto)
            const validDeltas = deltas.slice(1);
            const media = validDeltas.reduce((a, b) => a + b, 0) / validDeltas.length;
            const freq = 1000 / media;
            resolve(Math.round(freq));
          }
        });
      }
      catch (err) {
        console.log(err);
        resolve(0);
      }
    });
  }

  public async medirTodosSensores(samples = 100): Promise<SensorResult> {
    try {
      let freqMaxAcelerometro = 0;
      let freqMaxGiroscopio = 0;
      let freqMaxMagnetometro = 0;
      let freqMaxBarometro = 0;
      if (await Accelerometer.isAvailableAsync())
        freqMaxAcelerometro = await this.medirFrequencia("accelerometer", samples);

      if (await Gyroscope.isAvailableAsync())
        freqMaxGiroscopio = await this.medirFrequencia("gyroscope", samples);

      if (await Magnetometer.isAvailableAsync())
        freqMaxMagnetometro = await this.medirFrequencia("magnetometer", samples);

      if (await Barometer.isAvailableAsync())
        freqMaxBarometro = await this.medirFrequencia("barometer", samples);

      const obj = {
        frequenciaAcelerometro: freqMaxAcelerometro,
        frequenciaGiroscopio: freqMaxGiroscopio,
        frequenciaMagnetometro: freqMaxMagnetometro,
        frequenciaBarometro: freqMaxBarometro
      } as SensorResult;
      return obj;
    }
    catch (err) {
      console.error(err);
      throw new Error();
    }
  }
}

export default new SensorBenchmarkService();
