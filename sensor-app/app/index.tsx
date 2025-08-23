import { SafeAreaView, StyleSheet, View, Text, Button } from 'react-native';
import { Feather, FontAwesome, MaterialIcons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import { Accelerometer, Barometer, Magnetometer, Gyroscope } from "expo-sensors";
import RNFS from 'react-native-fs';

export default function Index() {

  const fileUri = RNFS.DownloadDirectoryPath + "/sensores.csv";
  const subscriptionRefs = useRef<any[]>([]);
  const buffer = useRef<any[]>([]);
  const intervalRef = useRef<number>(0);
  const latestData = useRef({
    ax: 0, ay: 0, az: 0,
    gx: 0, gy: 0, gz: 0,
    mx: 0, my: 0, mz: 0,
    barometer: 0,
  });

  const contadorDeRegistros = useRef<number>(0);

  useEffect(() => {
    return () => {
      stopLogging()
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startLogging = async () => {
    RNFS.writeFile(fileUri, 'timestamp,ax,ay,az,gx,gy,gz,mx,my,mz,barometer\n', 'utf8')
      .then(() => console.log('Arquivo CSV criado'))
      .catch(err => console.log('Erro ao criar CSV:', err));

    // Taxa de 10 Hz (100ms)
    Accelerometer.setUpdateInterval(100);
    Gyroscope.setUpdateInterval(100);
    Magnetometer.setUpdateInterval(100);
    Barometer.setUpdateInterval(100);

    // Criar listeners
    subscriptionRefs.current = [
      Accelerometer.addListener(({ x, y, z }) => {
        latestData.current.ax = x;
        latestData.current.ay = y;
        latestData.current.az = z;
      }),
      Gyroscope.addListener(({ x, y, z }) => {
        latestData.current.gx = x;
        latestData.current.gy = y;
        latestData.current.gz = z;
      }),
      Magnetometer.addListener(({ x, y, z }) => {
        latestData.current.mx = x;
        latestData.current.my = y;
        latestData.current.mz = z;
      }),
      Barometer.addListener(({ pressure }) => {
        latestData.current.barometer = pressure;
      }),
    ];

    intervalRef.current = setInterval(async () => {
      const d = latestData.current;
      const timestamp = Date.now();
      const line = `${timestamp},${d.ax},${d.ay},${d.az},${d.gx},${d.gy},${d.gz},${d.mx},${d.my},${d.mz},${d.barometer}\n`;
      contadorDeRegistros.current += 1;
      buffer.current.push(line);

      // Grava em bloco a cada 100 linhas (~1,6s a 60Hz)
      if (buffer.current.length >= 100) {
        const dataToWrite = buffer.current.join('');
        buffer.current = [];
        RNFS.appendFile(fileUri, dataToWrite, 'utf8')
          .catch(err => console.log('Erro ao escrever CSV:', err));
      }
    }, 100);

    setCorStatusColeta('green');
    setTextoColeta('EM ANDAMENTO');
  };

  const stopLogging = () => {
    intervalRef.current && clearInterval(intervalRef.current);

    // Grava qualquer dado restante
    if (buffer.current.length > 0) {
      const dataToWrite = buffer.current.join('');
      buffer.current = [];
      RNFS.appendFile(fileUri, dataToWrite, 'utf8').catch(err => console.log('Erro ao finalizar CSV:', err));
    }

    setCorStatusColeta('gray');
    setTextoColeta('AGUARDANDO');
  };

  const checkFiles = async () => {
    const files = await RNFS.readDir(RNFS.DocumentDirectoryPath);
  };

  const [corStatusColeta, setCorStatusColeta] = useState<string>('gray');
  const [textoColeta, setTextoColeta] = useState<string>('AGUARDANDO');

  return (
    <SafeAreaView style={styles.mainContainer}>
      <View style={styles.pageTitleContainer}>
        <Text style={styles.pageTitle}>Coletor de Dados</Text>
        <Text style={styles.subtitleText}>Aguardando conexão</Text>
      </View>
      <View style={styles.card}>
        <View style={styles.titleContainer}>
          <Feather name='cpu' size={25} color={'rgb(78, 136, 237)'} />
          <Text style={styles.titleText}>Informações dos sensores utilizados</Text>
        </View>
        <View style={styles.cardBody}>
          <View style={styles.containerInformacoesSensores}>
            <Text style={styles.labelInformacoesSensores}>Sensores Ativos:</Text>
            <Text style={styles.textInformacoesSensores}>• Acelerômetro</Text>
            <Text style={styles.textInformacoesSensores}>• Giroscópio</Text>
            <Text style={styles.textInformacoesSensores}>• Magnetômetro</Text>
            <Text style={styles.textInformacoesSensores}>• Barômetro</Text>
          </View>
          <View style={styles.containerInformacoesSensores}>
            <Text style={styles.labelInformacoesSensores}>Frequência de coleta:</Text>
            <Text style={styles.textInformacoesSensores}>60hz</Text>
          </View>
        </View>
      </View>
      <View style={[styles.card, { justifyContent: 'center', flex: 0.1 }]}>
        <View style={styles.statusColetaContainer}>
          <FontAwesome name='circle' size={20} color={corStatusColeta} />
          <Text style={styles.titleColetaText}>{textoColeta}</Text>
        </View>
      </View>
      <View style={styles.card}>
        <View style={styles.titleContainer}>
          <Feather name='file' size={25} color={'rgb(255, 150, 51)'} />
          <View style={{flexDirection: 'row', justifyContent: 'space-between', flex: 1}}>
            <Text style={styles.titleText}>Informações da coleta</Text>
            <Feather name='share' size={25} color={'rgb(255, 150, 51)'} />
          </View>
        </View>
        <View>
          <View style={styles.containerInformacoesSensores}>
            <Text style={styles.labelInformacoesSensores}>Usuário:</Text>
            <Text style={styles.textInformacoesSensores}>João Guilherme Nogueira</Text>
            <Text style={styles.textInformacoesSensores}>21 anos</Text>
          </View>
          <View style={styles.containerInformacoesSensores}>
            <Text style={styles.labelInformacoesSensores}>Registros coletados:</Text>
            <Text style={styles.textInformacoesSensores}>1200</Text>
          </View>
          <View style={styles.containerInformacoesSensores}>
            <Text style={styles.labelInformacoesSensores}>Tempo de coleta:</Text>
            <Text style={styles.textInformacoesSensores}>10s</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    marginTop: 20,
    flex: 1,
    gap: 10,
    padding: 15
  },
  card: {
    padding: 15,
    borderRadius: 5,
    backgroundColor: 'white',
    elevation: 3
  },
  cardBody: {
    flexDirection: 'row'
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start'
  },
  pageTitleContainer: {
    flex: 0.2,
    justifyContent: 'center',
    alignItems: 'center'
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: 'bold'
  },
  titleText: {
    fontWeight: 'bold',
    fontSize: 18,
    marginStart: 10
  },
  subtitleText: {
    fontSize: 18,
    opacity: 0.4
  },
  containerInformacoesSensores: {
    marginTop: 10,
    marginLeft: 20
  },
  labelInformacoesSensores: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  textInformacoesSensores: {
    marginLeft: 20,
  },
  titleColetaText: {
    fontWeight: 'bold',
    fontSize: 24,
    marginStart: 10
  },
  statusColetaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  }
});