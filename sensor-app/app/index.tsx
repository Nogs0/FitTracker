import { SafeAreaView, StyleSheet, View, Text, TouchableOpacity, Alert, FlatList, ActivityIndicator } from 'react-native';
import { Feather, FontAwesome } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import * as Sharing from 'expo-sharing';
import Cores from '@/styles/cores';
import BluetoothServerService from '@/services/BluetoothServerService';
import SensorLoggerService from "@/services/SensoresService";
import AsyncStorageService from "@/services/AsyncStorageService";
import SensorBenchmarkService from "@/services/SensorBenchmarkService";
import ModalDelete from '@/components/ModalDelete';
import RNFS from "react-native-fs";
import { zip } from "react-native-zip-archive";

export default function Index() {

  const [dadosIniciaisParaColeta, setDadosIniciaisParaColeta] = useState<any>();
  const [servidorLigado, setServidorLigado] = useState(false);
  const [textoBotaoBluetooth, setTextoBotaoBluetooth] = useState("Iniciar Bluetooth");
  const [corBotaoBluetooth, setCorBotaoBluetooth] = useState(Cores.azul);
  const [corStatusColeta, setCorStatusColeta] = useState<string>(Cores.cinza);
  const [textoColeta, setTextoColeta] = useState<string>('Servidor Desligado');
  const [coletaEmAndamento, setColetaEmAndamento] = useState<boolean>(false);
  const [coletasRealizadas, setColetasRealizadas] = useState<string[]>([]);
  const [modalDeleteColetaVisible, setModalDeleteColetaVisible] = useState<boolean>(false);
  const [fileToDelete, setFileToDelete] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    SensorLoggerService.requestStoragePermission();
    (async () => {
      const coletas = await AsyncStorageService.carregarColetas();
      setColetasRealizadas(coletas);
      setLoading(false);
    })();
  }, [])

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
      BluetoothServerService.sendMessage("servidorDesligado");
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
          SensorBenchmarkService.medirTodosSensores().then((sensores) => {
            const obj = {
              capacidadeSensores: true,
              sensores
            }
            BluetoothServerService.sendMessage(JSON.stringify(obj));
          });
        },
        (msg) => {

          if (stringCanBeConvertedToJSON(msg)) {
            let convertedJSON = JSON.parse(msg);
            if (convertedJSON.iniciarColeta) {
              BluetoothServerService.sendMessage("coletaIniciada");
              setDadosIniciaisParaColeta(convertedJSON);
              SensorLoggerService.startLogging(convertedJSON, () => {
                setColetaEmAndamento(true);
                setTextoColeta("Em andamento");
                setCorStatusColeta(Cores.verde);
                setCorBotaoBluetooth(Cores.cinza);
              });
            }
            if (convertedJSON.pararColeta) {
              SensorLoggerService.stopLogging(async (prefixo) => {
                setColetaEmAndamento(false);
                setTextoColeta("Coleta finalizada");
                setCorStatusColeta(Cores.laranja);
                setCorBotaoBluetooth(Cores.vermelho);
                const jsonEncerrarColeta = {
                  idColeta: convertedJSON.idColeta
                };
                BluetoothServerService.sendMessage(JSON.stringify(jsonEncerrarColeta));

                const novasColetas = [...coletasRealizadas, prefixo];
                await AsyncStorageService.salvarArquivos(novasColetas);
                setColetasRealizadas(coletasRealizadas => [...coletasRealizadas, prefixo]);
              });
            }
          }
          else if (msg === "encerrarConexao") {
            BluetoothServerService.stopServer().then(() => {
              setTextoColeta("Conexao encerrada");
              setServidorLigado(false);
              setColetaEmAndamento(false);
              setCorStatusColeta(Cores.cinza);
              setTextoBotaoBluetooth("Iniciar Bluetooth");
              setCorBotaoBluetooth(Cores.azul);
            })
          }
        });
    }
  }

  const compartilharColeta = async (prefixo: string) => {
    const isSharingAvailable = await Sharing.isAvailableAsync();
    if (!isSharingAvailable) {
      Alert.alert('Erro', 'O compartilhamento não está disponível neste dispositivo.');
      return;
    }
    const fileName = RNFS.DocumentDirectoryPath + "/" + prefixo;
    try {
      ziparArquivos([`${fileName}_accelerometer.csv`, `${fileName}_gyroscope.csv`, `${fileName}_magnetometer.csv`, `${fileName}_barometer.csv`], fileName + '.zip')
        .then(async (arquivoZip) => {
          await Sharing.shareAsync("file://" + arquivoZip, {
            mimeType: 'text/csv',
            dialogTitle: 'Compartilhar a coleta',
          });
        })
        .catch((err) => console.error(err));
    } catch (error) {
      console.error('Erro ao compartilhar o arquivo:', error);
      Alert.alert('Erro', 'Não foi possível compartilhar suas coleções.');
    }
  }

  const handleExcluirColeta = (item: string) => {
    setModalDeleteColetaVisible(true);
    setFileToDelete(item);
  }

  const excluirColeta = async (prefixo: string) => {
    const novasColetasRealizadas = [...coletasRealizadas];
    let index = novasColetasRealizadas.findIndex(x => x === prefixo);
    novasColetasRealizadas.splice(index, 1);
    await AsyncStorageService.salvarArquivos(novasColetasRealizadas);
    RNFS.unlink(RNFS.DocumentDirectoryPath + "/" + prefixo + '_accelerometer.csv');
    RNFS.unlink(RNFS.DocumentDirectoryPath + "/" + prefixo + '_gyroscope.csv');
    RNFS.unlink(RNFS.DocumentDirectoryPath + "/" + prefixo + '_magnetometer.csv');
    RNFS.unlink(RNFS.DocumentDirectoryPath + "/" + prefixo + '_barometer.csv');
    setColetasRealizadas((prev) => {
      let index = prev.findIndex(x => x === prefixo);
      prev.splice(index, 1);
      return [...prev];
    });

    setModalDeleteColetaVisible(false);
    setFileToDelete("");
  }

  const pararColeta = async (idColeta: number) => {
    SensorLoggerService.stopLogging(async (prefixo) => {
      setColetaEmAndamento(false);
      setTextoColeta("Coleta finalizada");
      setCorStatusColeta(Cores.laranja);
      setCorBotaoBluetooth(Cores.vermelho);
      const jsonEncerrarColeta = {
        idColeta: idColeta,
        finalizadoPeloServidor: true
      }
      BluetoothServerService.sendMessage(JSON.stringify(jsonEncerrarColeta));
      const novasColetasRealizadas = [...coletasRealizadas, prefixo];
      await AsyncStorageService.salvarArquivos(novasColetasRealizadas);
      setColetasRealizadas(coletasRealizadas => [...coletasRealizadas, prefixo]);
    });
  }

  async function ziparArquivos(files: string[], output: string) {
    const result = await zip(files, output);
    console.log("Arquivo ZIP criado em:", result);
    return result;
  }

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={Cores.ciano} />
        <Text>Carregando dados...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.mainContainer}>
      <ModalDelete
        visible={modalDeleteColetaVisible}
        setVisible={setModalDeleteColetaVisible}
        handleDelete={() => excluirColeta(fileToDelete)}
      />
      <View style={styles.pageTitleContainer}>
        <Text style={styles.pageTitle}>Coletor de dados</Text>
        <Text style={styles.subtitleText}>Aplicativo destinado ao monitoramento de sensores</Text>
      </View>
      <View style={[styles.card, { justifyContent: 'space-evenly', gap: 20, padding: 10 }]}>
        <View style={styles.statusColetaContainer}>
          <FontAwesome name='circle' size={20} color={corStatusColeta} />
          <Text style={styles.titleColetaText}>{textoColeta}</Text>
        </View>
        {coletaEmAndamento ?
          <Text style={{ fontSize: 20, textAlign: `center`, width: '100%', fontWeight: 'bold' }}>Atividade: {dadosIniciaisParaColeta.nomeAtividade}</Text> : <></>}
        <TouchableOpacity style={[styles.botaoBluetooth, { backgroundColor: corBotaoBluetooth }]}
          onPress={toggleConexoes}
          disabled={coletaEmAndamento}>
          <Text style={styles.textoBotaoBluetooth}>{textoBotaoBluetooth}</Text>
        </TouchableOpacity>
        {
          coletaEmAndamento ?
            <>
              <TouchableOpacity style={[styles.botaoBluetooth, { backgroundColor: Cores.vermelho }]}
                onPress={async () => await pararColeta(dadosIniciaisParaColeta.idColeta)}>
                <Text style={styles.textoBotaoBluetooth}>Parar coleta</Text>
              </TouchableOpacity>
            </>
            : <></>
        }
      </View>
      <View style={[styles.card, { height: '60%' }]}>
        <View style={styles.titleContainer}>
          <Feather name='file' size={25} color={Cores.laranja} />
          <Text style={styles.titleText}>Arquivos das coletas</Text>
        </View>
        <Text style={styles.subtitleText}>Coletas prontas para o compartilhamento</Text>
        <View style={{ marginTop: 20 }}>
          <FlatList
            data={coletasRealizadas}
            style={{ height: '90%' }}
            keyExtractor={(item, index) => index.toString()}
            contentContainerStyle={{ padding: 5, gap: 10 }}
            renderItem={({ item }) => {
              return (
                <View style={styles.card}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ fontSize: 12, flex: 0.8 }}>{item}</Text>
                    <View style={{ flexDirection: 'row', gap: 10, flex: 0.15 }}>
                      <TouchableOpacity onPress={() => handleExcluirColeta(item)}>
                        <Feather name='trash' size={15}></Feather>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => compartilharColeta(item)}>
                        <Feather name='share' size={15}></Feather>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              )
            }}
            ListEmptyComponent={() => (
              <Text style={{ textAlign: 'center', marginTop: 20, fontSize: 16, color: 'gray' }}>
                Nenhum arquivo encontrado
              </Text>
            )}
          />
        </View>
      </View>
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
    height: '7%',
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
    fontSize: 12,
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