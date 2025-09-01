import { Keyboard, KeyboardAvoidingView, SafeAreaView, ScrollView, TouchableWithoutFeedback, Text, TouchableOpacity, View, StyleSheet, Alert } from "react-native";
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
    const [connected, setConnected] = useState(false);
    const [messages, setMessages] = useState<string[]>([]);

    useEffect(() => {
        BluetoothClientService.requestBluetoothPermission()
            .then(() => {
                BluetoothClientService.disconnect().then(() => {
                    const loadDevices = async () => {
                        const bonded = await BluetoothClientService.getBondedDevices();
                        setBluetoothDevices(bonded);
                    };
                    loadDevices();
                })
            });
    }, []);

    const connect = async (device: any) => {
        try {

            await BluetoothClientService.connectToDevice(device.address, (msg) => {
                setMessages((prev) => [...prev, msg]);
            });
            setConnected(true);
            setModalBluetoothVisible(false);
        }
        catch {
            Alert.alert(`Conexão falhou`, `Erro desconhecido ao tentar se conectar com o dispositivo: \n${device.name}`)
        }
    };

    useFocusEffect(
        useCallback(() => {
            setUsuario(null);
            setAtividade(null);
            carregarUsuarios();
            carregarAtividades();
        }, [])
    );

    const [listaDeUsuarios, setListaDeUsuarios] = useState<any[]>([]);
    const [listaDeAtividades, setListaDeAtividades] = useState<any[]>([]);
    const listaDeFrequencias = [
        {
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
        },
    ];

    const [frequencia, setFrequencia] = useState<any>();
    const [usuario, setUsuario] = useState<any>();
    const [atividade, setAtividade] = useState<any>();
    const [coletaEmAndamento, setColetaEmAndamento] = useState<boolean>(false);
    const [idColeta, setIdColeta] = useState<number>(0);

    const carregarUsuarios = async () => {
        const usuarios = await getUsuarios();
        setListaDeUsuarios(usuarios);
    };

    const carregarAtividades = async () => {
        const atividades = await getAtividades();
        setListaDeAtividades(atividades);
    };

    const [corIconeCardColeta, setCorIconeCardColeta] = useState<string>(Cores.cinza);
    const [titleCardColeta, setTitleCardColeta] = useState<string>('Aguardando informações');

    const iniciarColeta = async () => {
        if (!usuario || !atividade)
            return;

        setBloqueado(true);
        setColetaEmAndamento(true);
        setCorIconeCardColeta(Cores.azul);
        setTitleCardColeta('Estabelecendo conexão');
        setIdColeta(await insertColeta(usuario?.nome, usuario?.idade, atividade.nome, Date.now().toString()));
        let mensagem = {
            iniciarColeta: true,
            pararColeta: false,
            nomeUsuario: usuario.nome,
            nomeAtividade: atividade.nome,
            frequencia: frequencia
        };
        const jsonString = JSON.stringify(mensagem);
        BluetoothClientService.sendMessage(jsonString + "\n")
    }

    const pararColeta = async () => {
        if (!usuario || !atividade)
            return;

        setBloqueado(false);
        setColetaEmAndamento(false);
        setCorIconeCardColeta('gray');
        setTitleCardColeta('Aguardando informações');
        await finalizarColeta(idColeta, Date.now().toString(), false, 0);
        let mensagem = {
            pararColeta: true,
            nomeUsuario: usuario.nome,
            nomeAtividade: atividade.nome,
        };
        const jsonString = JSON.stringify(mensagem);
        BluetoothClientService.sendMessage(jsonString + '\n');
    }

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={"height"}
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <ScrollView contentContainerStyle={{ flexGrow: 1 }}
                    keyboardShouldPersistTaps="handled">
                    <SafeAreaView style={stylesGlobal.mainContainer}>
                        <ModalSelectDeviceBluetooh
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
                            <Text style={stylesGlobal.subtitleText}>Selecione o usuário e a atividade física</Text>
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
                                                    <Picker.Item key={i} label={`${item.hertz}Hz`} value={item.milissegundos} />
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
                                (!usuario || !atividade ? stylesGlobal.buttonDisabled : {})]}
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