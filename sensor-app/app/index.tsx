import { SafeAreaView, StyleSheet, View, Text, TouchableOpacity, Alert } from 'react-native';
import { Feather, FontAwesome } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import { Accelerometer, Barometer, Magnetometer, Gyroscope } from "expo-sensors";
import RNFS from 'react-native-fs';
import BluetoothServerService from '@/services/BluetoothServerService';
import * as Sharing from 'expo-sharing';

export default function Index() {
  const [dadosIniciaisParaColeta, setDadosIniciaisParaColeta] = useState<any>();
  const [servidorLigado, setServidorLigado] = useState(false);
  const [coletaFinalizada, setColetaFinalizada] = useState(false);
  const [textoBotaoBluetooth, setTextoBotaoBluetooth] = useState("Iniciar Bluetooth");
  const [corBotaoBluetooth, setCorBotaoBluetooth] = useState('#4182ff');
  const [corStatusColeta, setCorStatusColeta] = useState<string>('gray');
  const [textoColeta, setTextoColeta] = useState<string>('Servidor Desligado');

  const fileUri = RNFS.DownloadDirectoryPath + "/";
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
  });

  const toggleConexoes = async () => {
    if (servidorLigado) {
      BluetoothServerService.stopServer().then(() => {
        setServidorLigado(false);
        setTextoColeta("Servidor Desligado");
        setTextoBotaoBluetooth("Iniciar Bluetooth");
        setCorBotaoBluetooth("#4182ff");
        setCorStatusColeta("gray");
      })
    }
    else {
      setTextoColeta("Servidor Disponível");
      setTextoBotaoBluetooth("Parar Bluetooth");
      setCorBotaoBluetooth("#e53935");
      setCorStatusColeta("#3dfff9");
      setServidorLigado(true);
      BluetoothServerService.startServer(
        (device) => {
          console.log("Conectado com:", device.name);
          setCorStatusColeta("blue");
          setTextoColeta("Conectado");
        },
        (msg) => {
          console.log(msg)
          if (stringCanBeConvertedToJSON(msg)) {
            let convertedJSON = JSON.parse(msg);
            if (convertedJSON.iniciarColeta) {
              setDadosIniciaisParaColeta(convertedJSON);
              startLogging(convertedJSON);
            }
            if (convertedJSON.pararColeta) {
              console.log(convertedJSON)
              stopLogging(convertedJSON.nomeUsuario, convertedJSON.nomeAtividade);
            }
          }
        });
    }
  }

  const startLogging = async (dadosDaColeta: any) => {
    const fileName = fileUri + dadosDaColeta.nomeUsuario + dadosDaColeta.nomeAtividade + '.csv';
    RNFS.writeFile(fileName, 'timestamp,ax,ay,az,gx,gy,gz,mx,my,mz,barometer\n', 'utf8')
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
        RNFS.appendFile(fileName, dataToWrite, 'utf8')
          .catch(err => console.log('Erro ao escrever CSV:', err));
      }
    }, 100);

    setCorStatusColeta('orange');
    setTextoColeta('Em Andamento');
  };

  const stopLogging = (nomeUsuario: string, nomeAtividade: string) => {
    intervalRef.current && clearInterval(intervalRef.current);
    console.log(dadosIniciaisParaColeta)
    // Grava qualquer dado restante
    if (buffer.current.length > 0) {
      const dataToWrite = buffer.current.join('');
      buffer.current = [];
      RNFS.appendFile(fileUri + nomeUsuario + nomeAtividade + '.csv', dataToWrite, 'utf8').catch(err => console.log('Erro ao finalizar CSV:', err));
    }
    setCorStatusColeta('green');
    setTextoColeta('Finalizado');
    setColetaFinalizada(true);
  };

  const compartilharColeta = async () => {
    const isSharingAvailable = await Sharing.isAvailableAsync();
    if (!isSharingAvailable) {
      Alert.alert('Erro', 'O compartilhamento não está disponível neste dispositivo.');
      return;
    }

    try {
      await Sharing.shareAsync("file://" + fileUri + dadosIniciaisParaColeta.nomeUsuario + dadosIniciaisParaColeta.nomeAtividade + '.csv', {
        mimeType: 'text/csv',
        dialogTitle: 'Compartilhar a coleta',
      });
    } catch (error) {
      console.error('Erro ao compartilhar o arquivo:', error);
      Alert.alert('Erro', 'Não foi possível compartilhar suas coleções.');
    }
  }

  const excluirColeta = async () => {
    if (await RNFS.exists(fileUri + dadosIniciaisParaColeta.fileName)) {
      await RNFS.unlink(fileUri + dadosIniciaisParaColeta.fileName)
    }
  }

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
      <TouchableOpacity style={
        {
          width: '100%',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: corBotaoBluetooth,
          padding: 10,
        }}
        onPress={toggleConexoes}>
        <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 18 }}>{textoBotaoBluetooth}</Text>
      </TouchableOpacity>
      {/* {coletaIniciada ?
        <View style={styles.card}>
          <View style={styles.titleContainer}>
            <Feather name='cpu' size={25} color={'rgb(78, 136, 237)'} />
            <Text style={styles.titleText}>Frequência utilizada</Text>
          </View>
          <View style={styles.cardBody}>
          </View>
        </View>
        : <></>} */}
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
                <Text>{dadosIniciaisParaColeta.fileName}</Text>
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