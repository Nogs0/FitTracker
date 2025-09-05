import { SafeAreaView, StyleSheet, View, Text, TouchableOpacity, Alert, FlatList, ActivityIndicator } from 'react-native';
import { Feather, FontAwesome } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import RNFS, { FileProtectionKeys } from 'react-native-fs';
import * as Sharing from 'expo-sharing';
import Cores from '@/styles/cores';
import BluetoothServerService from '@/services/BluetoothServerService';
import SensorLoggerService from "@/services/SensoresService";
import AsyncStorageService from "@/services/AsyncStorageService";
import ModalDelete from '@/components/ModalDelete';

export default function Index() {

  const [dadosIniciaisParaColeta, setDadosIniciaisParaColeta] = useState<any>();
  const [servidorLigado, setServidorLigado] = useState(false);
  const [coletaFinalizada, setColetaFinalizada] = useState(false);
  const [textoBotaoBluetooth, setTextoBotaoBluetooth] = useState("Iniciar Bluetooth");
  const [corBotaoBluetooth, setCorBotaoBluetooth] = useState(Cores.azul);
  const [corStatusColeta, setCorStatusColeta] = useState<string>(Cores.cinza);
  const [textoColeta, setTextoColeta] = useState<string>('Servidor Desligado');
  const [coletaEmAndamento, setColetaEmAndamento] = useState<boolean>(false);
  const [arquivosGerados, setArquivosGerados] = useState<string[]>([]);
  const [modalDeleteColetaVisible, setModalDeleteColetaVisible] = useState<boolean>(false);
  const [fileToDelete, setFileToDelete] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    SensorLoggerService.requestStoragePermission();
    (async () => {
      const arquivos = await AsyncStorageService.carregarArquivos();
      setArquivosGerados(arquivos);
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
            SensorLoggerService.stopLogging(() => {
              if (coletaEmAndamento)
                Alert.alert("O arquivo gerado pela coleta em andamento estará na pasta de 'Downloads' do dispositivo.")
            });
          }
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
              SensorLoggerService.stopLogging(async (qtdRegistros, fileName) => {
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
                const novosArquivos = [...arquivosGerados];
                novosArquivos.push(fileName);
                await AsyncStorageService.salvarArquivos(novosArquivos);
                setArquivosGerados(arquivosGerados => [...arquivosGerados, fileName]);
              });
            }
          }
        });
    }
  }

  const compartilharColeta = async (fileName: string) => {
    const isSharingAvailable = await Sharing.isAvailableAsync();
    if (!isSharingAvailable) {
      Alert.alert('Erro', 'O compartilhamento não está disponível neste dispositivo.');
      return;
    }

    try {
      await Sharing.shareAsync("file://" + fileName, {
        mimeType: 'text/csv',
        dialogTitle: 'Compartilhar a coleta',
      });
    } catch (error) {
      console.error('Erro ao compartilhar o arquivo:', error);
      Alert.alert('Erro', 'Não foi possível compartilhar suas coleções.');
    }
  }

  const handleExcluirColeta = (item: string) => {
    setModalDeleteColetaVisible(true);
    setFileToDelete(item);
  }

  const excluirColeta = async (fileName: string) => {
    const novosArquivos = [...arquivosGerados];
    let index = novosArquivos.findIndex(x => x === fileName);
    novosArquivos.splice(index, 1);
    await AsyncStorageService.salvarArquivos(novosArquivos);

    setArquivosGerados((prev) => {
      let index = prev.findIndex(x => x === fileName);
      prev.splice(index, 1);
      return [...prev];
    });

    setModalDeleteColetaVisible(false);
    setFileToDelete("");
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
        <Text style={styles.pageTitle}>Coletor de Dados</Text>
      </View>
      <View style={[styles.card, { justifyContent: 'center', height: 80 }]}>
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
      <View style={styles.card}>
        <View style={styles.titleContainer}>
          <Feather name='file' size={25} color={Cores.laranja} />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', flex: 1 }}>
            <Text style={styles.titleText}>Arquivos das coletas</Text>
          </View>
        </View>
        <View style={{ margin: 10 }}>
          <FlatList
            data={arquivosGerados}
            style={{ height: 300 }}
            keyExtractor={(item, index) => index.toString()}
            contentContainerStyle={{ padding: 5, gap: 10 }}
            renderItem={({ item }) => {
              return (
                <View style={styles.card}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ fontSize: 12, flex: 0.8 }}>{item.split(`/`).pop()}</Text>
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
    height: 50,
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