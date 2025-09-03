import { SafeAreaView, StyleSheet, View, Text, TouchableOpacity, Alert } from 'react-native';
import { Feather, FontAwesome } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import RNFS from 'react-native-fs';
import * as Sharing from 'expo-sharing';
import Cores from '@/styles/cores';
import BluetoothServerService from '@/services/BluetoothServerService';
import SensorLoggerService from "@/services/SensoresService";

export default function Index() {

  useEffect(() => {
    SensorLoggerService.requestStoragePermission()
  }, [])
  let dadosParaColeta: any = {};
  const [dadosIniciaisParaColeta, setDadosIniciaisParaColeta] = useState<any>();
  const [servidorLigado, setServidorLigado] = useState(false);
  const [coletaFinalizada, setColetaFinalizada] = useState(false);
  const [textoBotaoBluetooth, setTextoBotaoBluetooth] = useState("Iniciar Bluetooth");
  const [corBotaoBluetooth, setCorBotaoBluetooth] = useState(Cores.azul);
  const [corStatusColeta, setCorStatusColeta] = useState<string>(Cores.cinza);
  const [textoColeta, setTextoColeta] = useState<string>('Servidor Desligado');
  const [coletaEmAndamento, setColetaEmAndamento] = useState<boolean>(false);

  const fileUri = RNFS.DownloadDirectoryPath + "/";
  const stringCanBeConvertedToJSON = (msg: string) => {
    try {
      JSON.parse(msg);
      return true;
    }
    catch {
      return false;
    }
  }

  const toggleConexoes = async () => {
    if (servidorLigado) {
      BluetoothServerService.stopServer().then(() => {
        setServidorLigado(false);
        setTextoColeta("Servidor Desligado");
        setTextoBotaoBluetooth("Iniciar Bluetooth");
        setCorBotaoBluetooth(Cores.azul);
        setCorStatusColeta(Cores.cinza);
      })
    }
    else {
      setTextoColeta("Servidor Disponível");
      setTextoBotaoBluetooth("Parar Bluetooth");
      setCorBotaoBluetooth(Cores.vermelho);
      setCorStatusColeta(Cores.ciano);
      setServidorLigado(true);
      BluetoothServerService.startServer(
        (device) => {
          console.log("Conectado com:", device.name);
          setCorStatusColeta(Cores.azul);
          setTextoColeta("Conectado");
        },
        (msg) => {
          if (msg === "encerrarConexao") {
            BluetoothServerService.stopServer().then(() => {
              setTextoColeta("Conexao encerrada");
              setServidorLigado(false);
              setColetaFinalizada(false);
              setColetaEmAndamento(false);
              setCorStatusColeta(Cores.cinza);
              setTextoBotaoBluetooth("Iniciar Bluetooth");
              setCorBotaoBluetooth(Cores.azul);
            })
            SensorLoggerService.stopLogging(dadosParaColeta.nomeUsuario, dadosParaColeta.nomeAtividade, dadosParaColeta.frequenciaHertz, () => {
              if (coletaEmAndamento)
                Alert.alert("O arquivo gerado pela coleta em andamento estará na pasta de 'Downloads' do dispositiivo.")
            });
          }
          if (stringCanBeConvertedToJSON(msg)) {
            let convertedJSON = JSON.parse(msg);
            dadosParaColeta = convertedJSON;
            if (convertedJSON.iniciarColeta) {
              setDadosIniciaisParaColeta(convertedJSON);
              SensorLoggerService.startLogging(convertedJSON, () => {
                setColetaEmAndamento(true);
                setTextoColeta("Em andamento");
                setCorStatusColeta(Cores.verde);
                setCorBotaoBluetooth(Cores.cinza);
              });
            }
            if (convertedJSON.pararColeta) {
              SensorLoggerService.stopLogging(convertedJSON.nomeUsuario, convertedJSON.nomeAtividade, convertedJSON.frequenciaHertz, (qtdRegistros) => {
                setColetaFinalizada(true);
                setColetaEmAndamento(false);
                setTextoColeta("Coleta finalizada");
                setCorStatusColeta(Cores.laranja);
                setCorBotaoBluetooth(Cores.vermelho);
                const jsonEncerrarColeta = {
                  idColeta: convertedJSON.idColeta,
                  qtdDadosColetados: qtdRegistros
                }
                BluetoothServerService.sendMessage(JSON.stringify(jsonEncerrarColeta));
              });
            }
          }
        });
    }
  }

  const compartilharColeta = async () => {
    const isSharingAvailable = await Sharing.isAvailableAsync();
    if (!isSharingAvailable) {
      Alert.alert('Erro', 'O compartilhamento não está disponível neste dispositivo.');
      return;
    }

    try {
      await Sharing.shareAsync("file://" + fileUri + dadosIniciaisParaColeta.nomeUsuario + dadosIniciaisParaColeta.nomeAtividade + dadosIniciaisParaColeta.frequenciaHertz + 'Hz.csv', {
        mimeType: 'text/csv',
        dialogTitle: 'Compartilhar a coleta',
      });
    } catch (error) {
      console.error('Erro ao compartilhar o arquivo:', error);
      Alert.alert('Erro', 'Não foi possível compartilhar suas coleções.');
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
      <TouchableOpacity style={[styles.botaoBluetooth, { backgroundColor: corBotaoBluetooth }]}
        onPress={toggleConexoes}
        disabled={coletaEmAndamento}>
        <Text style={styles.textoBotaoBluetooth}>{textoBotaoBluetooth}</Text>
      </TouchableOpacity>
      {dadosIniciaisParaColeta ?
        <View style={styles.card}>
          <View style={styles.titleContainer}>
            <Feather name='cpu' size={25} color={Cores.azul} />
            <Text style={styles.titleText}>Frequência utilizada: {dadosIniciaisParaColeta.frequenciaHertz}Hz</Text>
          </View>
        </View>
        : <></>}
      {coletaFinalizada ?
        <View style={styles.card}>
          <View style={styles.titleContainer}>
            <Feather name='file' size={25} color={Cores.laranja} />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', flex: 1 }}>
              <Text style={styles.titleText}>Arquivo coleta</Text>
            </View>
          </View>
          <View style={{ margin: 10 }}>
            <View style={styles.card}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text>{dadosIniciaisParaColeta.nomeUsuario + dadosIniciaisParaColeta.nomeAtividade + dadosIniciaisParaColeta.frequenciaHertz + 'Hz.csv'}</Text>
                <View style={{ flexDirection: 'row', gap: 10 }}>
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
    backgroundColor: Cores.branco,
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
  },
  botaoBluetooth:
  {
    borderRadius: 5,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  textoBotaoBluetooth:
  {
    color: Cores.branco,
    fontWeight: 'bold',
    fontSize: 18
  }
});