import { Keyboard, KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, TouchableWithoutFeedback, Text, TouchableOpacity, View } from "react-native";
import stylesGlobal from '../../styles/global';
import { Feather, FontAwesome } from "@expo/vector-icons";
import { useState } from "react";
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';

export default function StartCollectionScreen() {
    const router = useRouter();

    const [usuario, setUsuario] = useState<string | undefined>();
    const [atividade, setAtividade] = useState<string | undefined>();

    const startCollection = () => {
        console.log(`coleta iniciada`);
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
                                        <Picker.Item label="Java" value="java" />
                                        <Picker.Item label="JavaScript" value="js" />
                                        <Picker.Item label="Python" value="python" />
                                    </Picker>
                                </View>
                                <View style={stylesGlobal.inputContainer}>
                                    <Text style={stylesGlobal.labelInput}>Atividade</Text>
                                    <Picker
                                        selectedValue={atividade}
                                        onValueChange={(itemValue) => setAtividade(itemValue)}
                                        style={stylesGlobal.pickerStyle}
                                    >
                                        <Picker.Item label="Java" value="java" />
                                        <Picker.Item label="JavaScript" value="js" />
                                        <Picker.Item label="Python" value="python" />
                                    </Picker>
                                </View>
                            </View>
                            <TouchableOpacity style={[stylesGlobal.button, stylesGlobal.buttonStartCollection]}
                                onPress={startCollection}>
                                <Text style={stylesGlobal.buttonLabel}>Iniciar coleta</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={stylesGlobal.card}>
                            <View style={stylesGlobal.titleContainer}>
                                <FontAwesome name='circle' size={25} color="rgba(139,139,139,1)" />
                                <Text style={stylesGlobal.titleText}>Configuração da coleta</Text>
                            </View>
                            <Text style={stylesGlobal.subtitleText}>Relatório em tempo real das coletas</Text>
                        </View>
                    </SafeAreaView>
                </ScrollView>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    )
}