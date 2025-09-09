import { Keyboard, KeyboardAvoidingView, SafeAreaView, ScrollView, TouchableWithoutFeedback, Text, TouchableOpacity, View, StyleSheet, Alert, ActivityIndicator } from "react-native";
import stylesGlobal from '@/styles/global';
import { Feather, FontAwesome } from "@expo/vector-icons";
import { useCallback, useEffect, useState } from "react";
import { Picker } from '@react-native-picker/picker';
import { useFocusEffect, useRouter } from 'expo-router';
import { finalizarColeta, insertColeta, getDB } from "@/data/database";
import { useNavigationBlock } from '@/contexts/NavigationBlockContext';
import BluetoothClientService from "@/services/BluetoothClientService";
import ModalSelectDeviceBluetooh from "@/components/ModalSelectDeviceBluetooh";
import Cores from "@/styles/cores";
import { useBluetoothConection } from "@/contexts/BluetoothConectionContext";
import Slider from "@react-native-community/slider";
type SensorResult = {
    frequenciaAcelerometro: number,
    frequenciaGiroscopio: number,
    frequenciaMagnetometro: number,
    frequenciaBarometro: number
};
export default function StartCollectionScreen() {

    const router = useRouter();
    const { setBloqueado } = useNavigationBlock();
    const { conectado, setConectado } = useBluetoothConection();
    const [dadosSensores, setDadosSensores] = useState<SensorResult>();
    const [modalBluetoohVisible, setModalBluetoothVisible] = useState(false);
    const [bluetoothDevices, setBluetoothDevices] = useState<any[]>([]);
    const [tentandoConectar, setTentandoConectar] = useState<boolean>(false);
    const [listaDeUsuarios, setListaDeUsuarios] = useState<any[]>([]);
    const [listaDeAtividades, setListaDeAtividades] = useState<any[]>([]);
    const [frequenciaAcelerometro, setFrequenciaAcelerometro] = useState<number>(0);
    const [frequenciaGiroscopio, setFrequenciaGiroscopio] = useState<number>(0);
    const [frequenciaMagnetometro, setFrequenciaMagnetometro] = useState<number>(0);
    const [frequenciaBarometro, setFrequenciaBarometro] = useState<number>(0);
    const [sensoresTrancados, setSensoresTrancados] = useState<boolean>(false);
    const [usuario, setUsuario] = useState<any>();
    const [atividade, setAtividade] = useState<any>();
    const [coletaEmAndamento, setColetaEmAndamento] = useState<boolean>(false);
    const [idColeta, setIdColeta] = useState<number>();
    const [estabelecendoConexao, setEstabelecendoConexao] = useState<boolean>(false);
    const [corIconeCardColeta, setCorIconeCardColeta] = useState<string>(Cores.cinza);
    const [titleCardColeta, setTitleCardColeta] = useState<string>('Aguardando informações');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        BluetoothClientService.requestBluetoothPermission(() => {
            BluetoothClientService.disconnect().then(() => {
                const loadDevices = async () => {
                    const bonded = await BluetoothClientService.getBondedDevices();
                    setBluetoothDevices(bonded);
                };
                loadDevices();
            })
        });
    }, []);

    useFocusEffect(
        useCallback(() => {
            if (!conectado) {
                setModalBluetoothVisible(true);
            }

            setUsuario(null);
            setAtividade(null);

            const carregarDados = async () => {
                try {
                    const db = await getDB(); // garante que o banco está inicializado
                    const dataU = await db.getAllAsync("SELECT * FROM usuarios;");
                    setListaDeUsuarios(dataU);

                    const dataA = await db.getAllAsync("SELECT * FROM atividades;");
                    setListaDeAtividades(dataA);
                } catch (error) {
                    console.log("Erro ao carregar:", error);
                } finally {
                    setLoading(false);
                }
            };

            carregarDados();

            return () => {
                setConectado(false);
                BluetoothClientService.disconnect();
            };
        }, [])
    );

    const stringCanBeConvertedToJSON = (msg: string) => {
        try {
            JSON.parse(msg);
            return true;
        }
        catch {
            return false;
        }
    }

    const connect = async (device: any) => {
        try {
            setTentandoConectar(true);
            await BluetoothClientService.connectToDevice(device.address,
                // onMessage
                async (msg) => {
                    if (stringCanBeConvertedToJSON(msg)) {
                        const convertedJSON = JSON.parse(msg);
                        if (convertedJSON.capacidadeSensores) {
                            setDadosSensores(convertedJSON.sensores);
                        }
                        else {
                            if (convertedJSON.finalizadoPeloServidor) {
                                setColetaEmAndamento(false);
                                setCorIconeCardColeta(Cores.laranja);
                                setTitleCardColeta('Coleta finalizada');
                            }
                            setBloqueado(false);
                            await finalizarColeta(convertedJSON.idColeta, Date.now().toString(), true);
                        }
                    }
                    else if (msg === "coletaIniciada") {
                        setEstabelecendoConexao(false);
                        setColetaEmAndamento(true);
                        setTitleCardColeta("Em andamento");
                        setCorIconeCardColeta(Cores.verde);
                    }
                    else if (msg === "servidorDesligado") {
                        Alert.alert("Atenção", "O servidor bluetooth foi desligado.",
                            [
                                {
                                    text: "OK",
                                    onPress: () => setModalBluetoothVisible(true)
                                }
                            ],
                            { cancelable: false }
                        );
                    }
                },
                // onConnect
                () => {
                    setConectado(true);
                    setTentandoConectar(false);
                    setModalBluetoothVisible(false);
                },
                // onError
                () => {
                    setTentandoConectar(false);
                    setBloqueado(false);
                });
        }
        catch {
            Alert.alert(`Conexão falhou`, `Erro desconhecido ao tentar se conectar com o dispositivo: \n${device.name}`)
        }
    };

    function sanitizeName(name: string) {
        return name
            .normalize("NFD")                 // separa acentos
            .replace(/[\u0300-\u036f]/g, "")  // remove acentos
            .replace(/[^a-zA-Z0-9_-]/g, "");  // remove caracteres inválidos
    }

    const iniciarColeta = async () => {
        if (!usuario || !atividade) {
            Alert.alert("Atenção", "Preencha todos os dados!");
            return;
        }
        setEstabelecendoConexao(true);
        setBloqueado(true);
        setCorIconeCardColeta(Cores.azul);
        setTitleCardColeta('Estabelecendo conexão');
        let idColetaAtual = await insertColeta(usuario?.nome, usuario?.idade, atividade.nome, Date.now().toString())
        setIdColeta(idColetaAtual);

        let mensagem = {
            iniciarColeta: true,
            pararColeta: false,
            nomeUsuario: sanitizeName(usuario.nome),
            nomeAtividade: sanitizeName(atividade.nome),
            frequenciaAcelerometro,
            frequenciaGiroscopio,
            frequenciaMagnetometro,
            frequenciaBarometro,
            idColeta: idColetaAtual
        };
        const jsonString = JSON.stringify(mensagem);
        BluetoothClientService.sendMessage(jsonString + "\n")
    }

    const pararColeta = async () => {
        setBloqueado(false);
        if (!coletaEmAndamento) {
            setTitleCardColeta('Conexão falhou');
            setCorIconeCardColeta(Cores.vermelho);
            setEstabelecendoConexao(false);
            return;
        } else {
            setColetaEmAndamento(false);
            setCorIconeCardColeta(Cores.laranja);
            setTitleCardColeta('Coleta finalizada');

            let mensagem = {
                idColeta: idColeta,
                pararColeta: true
            };
            const jsonString = JSON.stringify(mensagem);
            BluetoothClientService.sendMessage(jsonString);
        }
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
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={"height"}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <ScrollView contentContainerStyle={{ flexGrow: 1 }}
                    keyboardShouldPersistTaps="handled">
                    <SafeAreaView style={stylesGlobal.mainContainer}>
                        <ModalSelectDeviceBluetooh
                            tentandoConectar={tentandoConectar}
                            handleConnect={connect}
                            devices={bluetoothDevices}
                            visible={modalBluetoohVisible}
                            setVisible={setModalBluetoothVisible} />
                        <View style={stylesGlobal.pageTitleContainer}>
                            <TouchableOpacity style={[stylesStartCollection.buttonVoltar, (coletaEmAndamento ? stylesGlobal.buttonDisabled : {})]}
                                onPress={() => router.back()}
                                disabled={coletaEmAndamento}>
                                <Feather name='arrow-left' size={15} />
                                <Text>Voltar</Text>
                            </TouchableOpacity>
                            <View>
                                <Text style={stylesGlobal.pageTitle}>Coleta de dados</Text>
                                <Text style={stylesGlobal.subtitleText}>Configure e inicie a coleta</Text>
                            </View>
                        </View>
                        <View style={stylesGlobal.card}>
                            <View style={stylesGlobal.titleContainer}>
                                <FontAwesome name='gears' size={25} color={Cores.verde} />
                                <Text style={stylesGlobal.titleText}>Configuração da coleta</Text>
                            </View>
                            <View style={stylesGlobal.inputsContainer}>
                                <View style={stylesGlobal.inputContainer}>
                                    <Text style={stylesGlobal.labelInput}>Usuário</Text>
                                    <Picker
                                        selectedValue={usuario}
                                        onValueChange={(itemValue) => setUsuario(itemValue)}
                                        style={stylesStartCollection.pickerStyle}
                                        enabled={!coletaEmAndamento}
                                    >
                                        <Picker.Item label="Selecione um usuário" />
                                        {
                                            listaDeUsuarios.map((item, i) => {
                                                return (
                                                    <Picker.Item key={i} label={`${item.nome}, ${item.idade} anos`} value={item} />
                                                )
                                            })
                                        }
                                    </Picker>
                                </View>
                                <View style={stylesGlobal.inputContainer}>
                                    <Text style={stylesGlobal.labelInput}>Atividade</Text>
                                    <Picker
                                        selectedValue={atividade}
                                        onValueChange={(itemValue) => setAtividade(itemValue)}
                                        style={stylesStartCollection.pickerStyle}
                                        enabled={!coletaEmAndamento}
                                    >
                                        <Picker.Item label="Selecione uma atividade" />
                                        {
                                            listaDeAtividades.map((item, i) => {
                                                return (
                                                    <Picker.Item key={i} label={item.nome} value={item} />
                                                )
                                            })
                                        }
                                    </Picker>
                                </View>
                                {
                                    dadosSensores ?
                                        <View style={[stylesGlobal.card, { backgroundColor: Cores.cinzaClaro }]}>
                                            <View style={{ display: "flex", justifyContent: "space-between", flexDirection: `row` }}>
                                                <View style={stylesGlobal.titleContainer}>
                                                    <Feather name="cpu" size={25} color={Cores.azul} />
                                                    <Text style={stylesGlobal.titleText}>Sensores</Text>
                                                </View>
                                                <TouchableOpacity onPress={() => setSensoresTrancados(!sensoresTrancados)}>
                                                    <Feather
                                                        name={(sensoresTrancados ? "lock" : "unlock")}
                                                        size={25}
                                                        color={(sensoresTrancados ? Cores.vermelho : Cores.verde)} />
                                                </TouchableOpacity>
                                            </View>
                                            <View style={stylesGlobal.inputsContainer}>
                                                <View>
                                                    <Text style={stylesGlobal.labelInput}>Acelerômetro: {frequenciaAcelerometro}Hz</Text>
                                                    <Slider
                                                        style={{ width: '100%', height: 40 }}
                                                        minimumValue={0}
                                                        maximumValue={dadosSensores.frequenciaAcelerometro}
                                                        step={10}
                                                        value={frequenciaAcelerometro}
                                                        minimumTrackTintColor={Cores.verde}
                                                        maximumTrackTintColor={Cores.cinza}
                                                        thumbTintColor={Cores.verde}
                                                        onValueChange={setFrequenciaAcelerometro}
                                                        disabled={sensoresTrancados}
                                                    />
                                                </View>
                                                <View>
                                                    <Text style={stylesGlobal.labelInput}>Giroscópio: {frequenciaGiroscopio}Hz</Text>
                                                    <Slider
                                                        style={{ width: '100%', height: 40 }}
                                                        minimumValue={0}
                                                        maximumValue={dadosSensores.frequenciaGiroscopio}
                                                        step={10}
                                                        value={frequenciaGiroscopio}
                                                        minimumTrackTintColor={Cores.verde}
                                                        maximumTrackTintColor={Cores.cinza}
                                                        thumbTintColor={Cores.verde}
                                                        onValueChange={setFrequenciaGiroscopio}
                                                        disabled={sensoresTrancados}
                                                    />
                                                </View>
                                                <View>
                                                    {dadosSensores.frequenciaMagnetometro === 0 ?
                                                        <>
                                                            <Text style={stylesGlobal.labelInput}>Magnetômetro:</Text>
                                                            <Text style={{ height: 40 }}>Não disponível</Text>
                                                        </>
                                                        :
                                                        <>
                                                            <Text style={stylesGlobal.labelInput}>Magnetômetro: {frequenciaMagnetometro}Hz</Text>
                                                            <Slider
                                                                style={{ width: '100%', height: 40 }}
                                                                minimumValue={0}
                                                                maximumValue={dadosSensores.frequenciaMagnetometro}
                                                                step={10}
                                                                value={frequenciaMagnetometro}
                                                                minimumTrackTintColor={Cores.verde}
                                                                maximumTrackTintColor={Cores.cinza}
                                                                thumbTintColor={Cores.verde}
                                                                onValueChange={setFrequenciaMagnetometro}
                                                                disabled={sensoresTrancados}
                                                            />
                                                        </>
                                                    }
                                                </View>
                                                <View>
                                                    {dadosSensores.frequenciaBarometro === 0 ?
                                                        <>
                                                            <Text style={stylesGlobal.labelInput}>Barômetro:</Text>
                                                            <Text style={{ height: 40 }}>Não Disponível</Text>
                                                        </>
                                                        :
                                                        <>
                                                            <Text style={stylesGlobal.labelInput}>Barômetro: {frequenciaBarometro}Hz</Text>
                                                            <Slider
                                                                style={{ width: '100%', height: 40 }}
                                                                minimumValue={0}
                                                                maximumValue={dadosSensores.frequenciaBarometro}
                                                                step={10}
                                                                value={frequenciaBarometro}
                                                                minimumTrackTintColor={Cores.verde}
                                                                maximumTrackTintColor={Cores.cinza}
                                                                thumbTintColor={Cores.verde}
                                                                onValueChange={setFrequenciaBarometro}
                                                                disabled={sensoresTrancados}
                                                            />
                                                        </>
                                                    }
                                                </View>
                                            </View>
                                        </View>
                                        : <></>
                                }
                            </View>
                            {coletaEmAndamento ?
                                <TouchableOpacity style={[stylesStartCollection.buttonStartStopCollection, stylesStartCollection.buttonStopCollection]}
                                    onPress={pararColeta}>
                                    <Text style={[stylesGlobal.buttonLabel, stylesStartCollection.buttonLabelStartCollection]}>Parar coleta</Text>
                                    <FontAwesome name='stop' size={30} color={Cores.branco} />
                                </TouchableOpacity>
                                :
                                !estabelecendoConexao ?
                                    <TouchableOpacity style={[stylesStartCollection.buttonStartStopCollection, stylesStartCollection.buttonStartCollection]}
                                        onPress={iniciarColeta}>
                                        <Text style={[stylesGlobal.buttonLabel, stylesStartCollection.buttonLabelStartCollection]}>Iniciar coleta</Text>
                                        <FontAwesome name='play' size={30} color={Cores.branco} />
                                    </TouchableOpacity> :
                                    <TouchableOpacity style={[stylesStartCollection.buttonStartStopCollection, stylesStartCollection.buttonStopCollection]}
                                        onPress={pararColeta}>
                                        <Text style={[stylesGlobal.buttonLabel, stylesStartCollection.buttonLabelStartCollection]}>Encerrar tentativa</Text>
                                        <FontAwesome name='stop' size={30} color={Cores.branco} />
                                    </TouchableOpacity>
                            }
                        </View>
                        <View style={stylesGlobal.card}>
                            <View style={stylesGlobal.titleContainer}>
                                <FontAwesome name='circle' size={25} color={corIconeCardColeta} />
                                <Text style={stylesGlobal.titleText}>{titleCardColeta}</Text>
                            </View>
                        </View>
                    </SafeAreaView>
                </ScrollView>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    )
}

const stylesStartCollection = StyleSheet.create({
    buttonLabelStartCollection: {
        fontSize: 20
    },
    buttonStartStopCollection: {
        flexDirection: 'row',
        padding: 10,
        color: Cores.branco,
        alignItems: 'center',
        justifyContent: 'space-evenly',
        borderRadius: 5,
    },
    buttonStopCollection: {
        backgroundColor: Cores.vermelho
    },
    buttonStartCollection: {
        backgroundColor: Cores.verde
    },
    pickerStyle: {
        width: '100%'
    },
    buttonVoltar: {
        flexDirection: 'row',
        backgroundColor: Cores.branco,
        alignItems: 'center',
        width: 'auto',
        padding: 5,
        borderRadius: 5,
        justifyContent: 'space-around',
        elevation: 5,
    }
})