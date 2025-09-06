import { Keyboard, KeyboardAvoidingView, SafeAreaView, ScrollView, TouchableWithoutFeedback, Text, TouchableOpacity, View, StyleSheet, Alert, ActivityIndicator } from "react-native";
import stylesGlobal from '@/styles/global';
import { Feather, FontAwesome } from "@expo/vector-icons";
import { useCallback, useEffect, useState } from "react";
import { Picker } from '@react-native-picker/picker';
import { useFocusEffect, useRouter } from 'expo-router';
import { finalizarColeta, getAtividades, getUsuarios, insertColeta } from "@/data/database";
import { useNavigationBlock } from '@/contexts/NavigationBlockContext';
import BluetoothClientService from "@/services/BluetoothClientService";
import ModalSelectDeviceBluetooh from "@/components/ModalSelectDeviceBluetooh";
import Cores from "@/styles/cores";

export default function StartCollectionScreen() {

    const router = useRouter();
    const { setBloqueado } = useNavigationBlock();

    const [modalBluetoohVisible, setModalBluetoothVisible] = useState(true);
    const [bluetoothDevices, setBluetoothDevices] = useState<any[]>([]);
    const [tentandoConectar, setTentandoConectar] = useState<boolean>(false);

    const [listaDeUsuarios, setListaDeUsuarios] = useState<any[]>([]);
    const [listaDeAtividades, setListaDeAtividades] = useState<any[]>([]);
    const loading = !listaDeAtividades || !listaDeUsuarios;
    const [listaDeFrequencias] = useState<any[]>([{
        hertz: 10,
        milissegundos: 100
    },
    {
        hertz: 15,
        milissegundos: 66
    },
    {
        hertz: 30,
        milissegundos: 33
    },
    {
        hertz: 60,
        milissegundos: 16
    },]);

    const [frequencia, setFrequencia] = useState<any>();
    const [usuario, setUsuario] = useState<any>();
    const [atividade, setAtividade] = useState<any>();
    const [coletaEmAndamento, setColetaEmAndamento] = useState<boolean>(false);
    const [idColeta, setIdColeta] = useState<number>();

    const [corIconeCardColeta, setCorIconeCardColeta] = useState<string>(Cores.cinza);
    const [titleCardColeta, setTitleCardColeta] = useState<string>('Aguardando informações');


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
            setUsuario(null);
            setAtividade(null);
            getUsuarios().then((res) => {
                setListaDeUsuarios(res);
            });
            getAtividades().then((res) => {
                setListaDeAtividades(res);
            });

            return () => {
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
            await BluetoothClientService.connectToDevice(device.address, async (msg) => {
                if (msg === "coletaIniciada") {
                    setTitleCardColeta("Em andamento");
                    setCorIconeCardColeta(Cores.verde);
                }
                if (stringCanBeConvertedToJSON(msg)) {
                    setBloqueado(false);
                    const convertedJSON = JSON.parse(msg);
                    await finalizarColeta(convertedJSON.idColeta, Date.now().toString(), true, convertedJSON.qtdDadosColetados);
                }
            },
                () => {
                    setBloqueado(true);
                    setTentandoConectar(false);
                    setModalBluetoothVisible(false);
                },
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
        if (!usuario || !atividade || !frequencia)
            return;

        setBloqueado(true);
        setColetaEmAndamento(true);
        setCorIconeCardColeta(Cores.azul);
        setTitleCardColeta('Estabelecendo conexão');
        setIdColeta(await insertColeta(usuario?.nome, usuario?.idade, atividade.nome, Date.now().toString()));

        let mensagem = {
            iniciarColeta: true,
            pararColeta: false,
            nomeUsuario: sanitizeName(usuario.nome),
            nomeAtividade: sanitizeName(atividade.nome),
            frequenciaMilissegundos: frequencia.milissegundos,
            frequenciaHertz: frequencia.hertz,
            idColeta: idColeta
        };
        const jsonString = JSON.stringify(mensagem);
        BluetoothClientService.sendMessage(jsonString + "\n")
    }

    const pararColeta = async () => {
        if (!usuario || !atividade)
            return;

        setBloqueado(false);
        setColetaEmAndamento(false);
        setCorIconeCardColeta(Cores.laranja);
        setTitleCardColeta('Coleta finalizada');
        let mensagem = {
            idColeta: idColeta,
            pararColeta: true
        };
        const jsonString = JSON.stringify(mensagem);
        BluetoothClientService.sendMessage(jsonString + '\n');
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
                            <Text style={stylesGlobal.subtitleText}>Selecione usuário, atividade física e frequência</Text>
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
                                <View style={stylesGlobal.inputContainer}>
                                    <Text style={stylesGlobal.labelInput}>Frequência</Text>
                                    <Picker
                                        selectedValue={frequencia}
                                        onValueChange={(itemValue) => setFrequencia(itemValue)}
                                        style={stylesStartCollection.pickerStyle}
                                        enabled={!coletaEmAndamento}
                                    >
                                        <Picker.Item label="Selecione a frequência" />
                                        {
                                            listaDeFrequencias.map((item, i) => {
                                                return (
                                                    <Picker.Item key={i} label={`${item.hertz}Hz`} value={item} />
                                                )
                                            })
                                        }
                                    </Picker>
                                </View>
                            </View>
                            {coletaEmAndamento ?
                                <TouchableOpacity style={[stylesStartCollection.buttonStartStopCollection, stylesStartCollection.buttonStopCollection]}
                                    onPress={pararColeta}>
                                    <Text style={[stylesGlobal.buttonLabel, stylesStartCollection.buttonLabelStartCollection]}>Parar coleta</Text>
                                    <FontAwesome name='stop' size={30} color={Cores.branco} />
                                </TouchableOpacity>
                                :
                                <TouchableOpacity style={[stylesStartCollection.buttonStartStopCollection, stylesStartCollection.buttonStartCollection,
                                (!usuario || !atividade || !frequencia ? stylesGlobal.buttonDisabled : {})]}
                                    disabled={!usuario || !atividade}
                                    onPress={iniciarColeta}>
                                    <Text style={[stylesGlobal.buttonLabel, stylesStartCollection.buttonLabelStartCollection]}>Iniciar coleta</Text>
                                    <FontAwesome name='play' size={30} color={Cores.branco} />
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