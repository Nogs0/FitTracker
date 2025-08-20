import { Keyboard, KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, TouchableWithoutFeedback, Text, TouchableOpacity, View } from "react-native";
import stylesGlobal from '../../styles/global';
import { Feather, FontAwesome } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';
import { getAtividades, getUsuarios } from "@/data/database";

export default function StartCollectionScreen() {
    const router = useRouter();

    useEffect(() => {
        carregarUsuarios();
        carregarAtividades();
    }, [])
    
    const [listaDeUsuarios, setListaDeUsuarios] = useState<any[]>([]);
    const [listaDeAtividades, setListaDeAtividades] = useState<any[]>([]);

    const [usuario, setUsuario] = useState<string | undefined>();
    const [atividade, setAtividade] = useState<string | undefined>();

    const carregarUsuarios = async () => {
        const usuarios = await getUsuarios();
        setListaDeUsuarios(usuarios);
    };

    const carregarAtividades = async () => {
        const atividades = await getAtividades();
        setListaDeAtividades(atividades);
    };

    const [corIconeCardColeta, setCorIconeCardColeta] = useState<string>('gray');
    const [titleCardColeta, setTitleCardColeta] = useState<string>('Aguardando informações');

    const iniciarColeta = () => {
        setCorIconeCardColeta('rgb(78, 136, 237)');
        setTitleCardColeta('Estrabelecendo conexão');
    }

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <ScrollView contentContainerStyle={{ flexGrow: 1 }}
                    keyboardShouldPersistTaps="handled">
                    <SafeAreaView style={stylesGlobal.mainContainer}>
                        <View style={stylesGlobal.pageTitleContainer}>
                            <TouchableOpacity style={stylesGlobal.buttonVoltar}
                                onPress={() => router.back()}>
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
                                <Feather name='play' size={25} color="rgba(52,184,55,1)" />
                                <Text style={stylesGlobal.titleText}>Configuração da coleta</Text>
                            </View>
                            <Text style={stylesGlobal.subtitleText}>Selecione o usuário e a atividade física</Text>
                            <View style={stylesGlobal.inputsContainer}>
                                <View style={stylesGlobal.inputContainer}>
                                    <Text style={stylesGlobal.labelInput}>Usuário</Text>
                                    <Picker
                                        selectedValue={usuario}
                                        onValueChange={(itemValue) => setUsuario(itemValue)}
                                        style={stylesGlobal.pickerStyle}
                                    >
                                        <Picker.Item label="Selecione um usuário" />
                                        {
                                            listaDeUsuarios.map((item, i) => {
                                                return (
                                                    <Picker.Item key={i} label={`${item.nome}, ${item.idade}`} value={item.id} />
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
                                        style={stylesGlobal.pickerStyle}
                                    >
                                        <Picker.Item label="Selecione uma atividade" />
                                        {
                                            listaDeAtividades.map((item, i) => {
                                                return (
                                                    <Picker.Item key={i} label={item.nome} value={item.id} />
                                                )
                                            })
                                        }
                                    </Picker>
                                </View>
                            </View>
                            <TouchableOpacity style={[stylesGlobal.button, stylesGlobal.buttonStartCollection]}
                                onPress={iniciarColeta}>
                                <Text style={stylesGlobal.buttonLabel}>Iniciar coleta</Text>
                            </TouchableOpacity>
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