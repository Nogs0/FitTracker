import { SafeAreaView, StyleSheet, View, Text, TouchableOpacity, Alert } from 'react-native';
import { Feather, FontAwesome } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import { Accelerometer, Barometer, Magnetometer, Gyroscope } from "expo-sensors";
import RNFS from 'react-native-fs';
import BluetoothServerService from '@/services/BluetoothServerService';
import * as Sharing from 'expo-sharing';
import { jsiConfigureProps } from 'react-native-reanimated/lib/typescript/core';

export default function Index() {
  const [messages, setMessages] = useState<string[]>([]);
  const [connected, setConnected] = useState(false);
  const [coletaIniciada, setColetaIniciada] = useState(false);
  const [coletaFinalizada, setColetaFinalizada] = useState(false);

  const fileUri = RNFS.DownloadDirectoryPath + "/relatoriosSensores/";
  const [fileName, setFileName] = useState("teste.csv");
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

  const stringCanBeConvertedToJSON = (msg: string) => {
    try {
      JSON.parse(msg);
      return true;
    }
    catch {
      return false;
    }
  }
  useEffect(() => {
    BluetoothServerService.startServer(
      (device) => {
        setConnected(true);
        setCorStatusColeta("blue")
        setTextoColeta("Conectado");
        console.log("Conectado com:", device.name);
      },
      (msg) => {
        setMessages((prev) => [...prev, msg]);
        console.log(msg)
        if (stringCanBeConvertedToJSON(msg)) {
          let convertedJSON = JSON.parse(msg);
          setFileName(convertedJSON.fileName);
          if (convertedJSON.iniciarColeta)
            startLogging(convertedJSON);
          if (convertedJSON.pararColeta)
            stopLogging();
        }
      });

    return () => {
      // BluetoothServerService.stopServer();
      // stopLogging();
    };
  });

  const startLogging = async (dadosDaColeta: any) => {
    setColetaIniciada(true);

    RNFS.writeFile(fileUri + fileName, 'timestamp,ax,ay,az,gx,gy,gz,mx,my,mz,barometer\n', 'utf8')
      .then(() => console.log('Arquivo CSV criado'))
      .catch(err => console.log('Erro ao criar CSV:', err));

    // Taxa de 10 Hz (100ms)
    Accelerometer.setUpdateInterval(dadosDaColeta.frequencia);
    Gyroscope.setUpdateInterval(dadosDaColeta.frequencia);
    Magnetometer.setUpdateInterval(dadosDaColeta.frequencia);
    Barometer.setUpdateInterval(dadosDaColeta.frequencia);

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
        RNFS.appendFile(fileUri + fileName, dataToWrite, 'utf8')
          .catch(err => console.log('Erro ao escrever CSV:', err));
      }
    }, 100);

    setCorStatusColeta('orange');
    setTextoColeta('Em Andamento');
  };

  const stopLogging = () => {
    intervalRef.current && clearInterval(intervalRef.current);

    // Grava qualquer dado restante
    if (buffer.current.length > 0) {
      const dataToWrite = buffer.current.join('');
      buffer.current = [];
      RNFS.appendFile(fileUri + fileName, dataToWrite, 'utf8').catch(err => console.log('Erro ao finalizar CSV:', err));
    }
    setCorStatusColeta('green');
    setTextoColeta('Finalizado');
  };

  const compartilharColeta = async () => {
    const isSharingAvailable = await Sharing.isAvailableAsync();
    if (!isSharingAvailable) {
      Alert.alert('Erro', 'O compartilhamento não está disponível neste dispositivo.');
      return;
    }

    try {
      await Sharing.shareAsync("file://" + fileUri, {
        mimeType: 'text/csv',
        dialogTitle: 'Compartilhar a coleta',
      });
    } catch (error) {
      console.error('Erro ao compartilhar o arquivo:', error);
      Alert.alert('Erro', 'Não foi possível compartilhar suas coleções.');
    }
  }

  const excluirColeta = async () => {
    if (await RNFS.exists(fileUri + fileName)) {
      await RNFS.unlink(fileUri + fileName)
    }
  }

  const [corStatusColeta, setCorStatusColeta] = useState<string>('gray');
  const [textoColeta, setTextoColeta] = useState<string>('Aguardando Conexão');

  return (
    <SafeAreaView style={styles.mainContainer}>
      <View style={styles.pageTitleContainer}>
        <Text style={styles.pageTitle}>Coletor de Dados</Text>
      </View>
      <View style={[styles.card, { justifyContent: 'center', flex: 0.1 }]}>
        <View style={styles.statusColetaContainer}>
          <FontAwesome name='circle' size={20} color={corStatusColeta} />
          <Text style={styles.titleColetaText}>{textoColeta}</Text>
        </View>
      </View>
      {coletaIniciada ?
        <View style={styles.card}>
          <View style={styles.titleContainer}>
            <Feather name='cpu' size={25} color={'rgb(78, 136, 237)'} />
            <Text style={styles.titleText}>Informações dos sensores utilizados</Text>
          </View>
          <View style={styles.cardBody}>
          </View>
        </View>
        : <></>}
      {coletaFinalizada ?
        <View style={styles.card}>
          <View style={styles.titleContainer}>
            <Feather name='file' size={25} color={'rgb(255, 150, 51)'} />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', flex: 1 }}>
              <Text style={styles.titleText}>Informações da coleta</Text>
            </View>
          </View>
          <View>
            <View style={styles.card}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text>{fileName}</Text>
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <TouchableOpacity onPress={excluirColeta}>
                    <Feather name='trash' size={20}></Feather>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={compartilharColeta}>
                    <Feather name='share' size={20}></Feather>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </View>
        : <></>}
    </SafeAreaView >
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