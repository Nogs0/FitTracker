import { Feather } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Platform, StyleSheet, Text, View, SafeAreaView, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard } from 'react-native';
import uuid from 'react-native-uuid';
import stylesGlobal from '../../styles/global';
import { useRouter } from 'expo-router';
import { insertUsuario, getUsuarios, deleteUsuario, insertAtividade, getAtividades, deleteAtividade } from '../../../data/database';

export default function SettingsScreen() {
  const router = useRouter();

  useEffect(() => {
    carregarUsuarios();
    carregarAtividades();
  }, [])

  const [idadeUsuario, setIdadeUsuario] = useState<string | undefined>();
  const [nomeUsuario, setNomeUsuario] = useState<string | undefined>();

  const [nomeAtividade, setNomeAtividade] = useState<string | undefined>();

  const [listaDeUsuarios, setListaDeUsuarios] = useState<any[]>([]);
  const [listaDeAtividades, setListaDeAtividades] = useState<any[]>([]);
  // 🔹 Carregar usuários
  const carregarUsuarios = async () => {
    const usuarios = await getUsuarios();
    setListaDeUsuarios(usuarios);
  };

  // 🔹 Adicionar usuário
  const addUsuario = async () => {
    if (!nomeUsuario || !idadeUsuario) return;

    Keyboard.dismiss();
    await insertUsuario(nomeUsuario, parseInt(idadeUsuario));
    setNomeUsuario('');
    setIdadeUsuario('');
    carregarUsuarios();
  };

  // 🔹 Excluir usuário
  const excluirUsuario = async (id: number) => {
    await deleteUsuario(id);
    console.log('Excluído com sucesso!');
    carregarUsuarios();
  };

  // 🔹 Criar card do usuário
  const createCardUsuario = (item: any) => {
    return (
      <View key={item.id} style={stylesGlobal.cardList}>
        <Text>{item.nome}, {item.idade} anos</Text>
        <TouchableOpacity onPress={() => excluirUsuario(item.id)} style={{ padding: 5 }}>
          <Feather name='trash' color='gray' size={20} />
        </TouchableOpacity>
      </View>
    );
  };

  // 🔹 Carregar atividades
  const carregarAtividades = async () => {
    const atividades = await getAtividades();
    setListaDeAtividades(atividades);
  };

  // 🔹 Adicionar atividade
  const addAtividade = async () => {
    if (!nomeAtividade) return;

    Keyboard.dismiss();
    await insertAtividade(nomeAtividade);
    setNomeAtividade('');
    carregarAtividades();
  };

  // 🔹 Excluir atividade
  const excluirAtividade = async (id: number) => {
    await deleteAtividade(id);
    console.log('Excluído com sucesso!');
    carregarAtividades();
  };


  const createCardAtividade = (item: any) => {
    return (
      <View key={item.id} style={stylesGlobal.cardList}>
        <Text>{item.nome}</Text>
        <TouchableOpacity onPress={() => excluirAtividade(item.id)} style={{ padding: 5 }}>
          <Feather name='trash' color='gray' size={20}></Feather>
        </TouchableOpacity>
      </View>
    )
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
            <View>
              <Text style={stylesGlobal.pageTitle}>Configurações da coleta</Text>
              <Text style={stylesGlobal.subtitleText}>Cadastre usuários e atividades físicas</Text>
            </View>
            <View style={stylesGlobal.card}>
              <View style={stylesGlobal.titleContainer}>
                <Feather name='users' size={25} color="rgb(78, 136, 237)" />
                <Text style={stylesGlobal.titleText}>Cadastro de usuários</Text>
              </View>
              <Text style={stylesGlobal.subtitleText}>Adicione usuários a serem monitorados</Text>
              <View style={stylesGlobal.inputsContainer}>
                <View style={stylesGlobal.inputContainer}>
                  <Text style={stylesGlobal.labelInput}>Nome</Text>
                  <TextInput style={stylesGlobal.inputCustomized}
                    value={nomeUsuario}
                    onChangeText={setNomeUsuario}
                    placeholder='Digite o nome do usuário' />
                </View>
                <View style={stylesGlobal.inputContainer}>
                  <Text style={stylesGlobal.labelInput}>Idade</Text>
                  <TextInput style={stylesGlobal.inputCustomized}
                    value={idadeUsuario}
                    onChangeText={text => setIdadeUsuario(text.replace(/[^0-9]/g, ''))}
                    keyboardType='numeric' placeholder='Digite a idade do usuário' />
                </View>
              </View>
              <TouchableOpacity style={[stylesGlobal.button, stylesSettings.buttonAddUser]}
                onPress={addUsuario}>
                <Feather name='plus' size={25} color='white' />
                <Text style={stylesGlobal.buttonLabel}>Adicionar usuário</Text>
              </TouchableOpacity>
              <View style={stylesGlobal.containerList}>
                {listaDeUsuarios.length > 0 ?
                  <Text style={stylesGlobal.labelList}>Usuários cadastrados ({listaDeUsuarios.length}):</Text>
                  : <></>}
                {listaDeUsuarios.map((user, i) => createCardUsuario(user))}
              </View>
            </View>
            <View style={stylesGlobal.card}>
              <View style={stylesGlobal.titleContainer}>
                <Feather name='activity' size={25} color="rgba(82,172,99,1)" />
                <Text style={stylesGlobal.titleText}>Cadastro de atividades</Text>
              </View>
              <Text style={stylesGlobal.subtitleText}>Adicione as atividades disponíveis</Text>
              <View style={stylesGlobal.inputsContainer}>
                <View style={stylesGlobal.inputContainer}>
                  <Text style={stylesGlobal.labelInput}>Nome da atividade</Text>
                  <TextInput style={stylesGlobal.inputCustomized}
                    value={nomeAtividade}
                    onChangeText={setNomeAtividade}
                    placeholder='Digite o nome da atividade' />
                </View>
              </View>
              <TouchableOpacity style={[stylesGlobal.button, stylesSettings.buttonAddActivity]}
                onPress={addAtividade}>
                <Feather name='plus' size={25} color='white' />
                <Text style={stylesGlobal.buttonLabel}>Adicionar atividade</Text>
              </TouchableOpacity>
              <View style={stylesGlobal.containerList}>
                {listaDeAtividades.length > 0 ?
                  <Text style={stylesGlobal.labelList}>Atividades cadastradas ({listaDeAtividades.length}):</Text>
                  : <></>}
                {listaDeAtividades.map((atividade, i) => createCardAtividade(atividade))}
              </View>
            </View>
            <TouchableOpacity
              style={listaDeAtividades.length === 0 || listaDeUsuarios.length === 0 ? stylesSettings.buttonStartDataCollectionDisabled : stylesSettings.buttonStartDataCollection}
              disabled={listaDeAtividades.length === 0 || listaDeUsuarios.length === 0}
              onPress={() => router.push('/settings/collectionData')}>
              <Text style={[stylesGlobal.buttonLabel, stylesSettings.buttonLabelStartDataCollection]}>Iniciar coleta de dados</Text>
              <Feather name='arrow-right' size={30} color='white' />
            </TouchableOpacity>
          </SafeAreaView>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const stylesSettings = StyleSheet.create({
  buttonLabelStartDataCollection: {
    fontSize: 20
  },
  buttonAddUser: {
    backgroundColor: 'rgb(78, 136, 237)'
  },
  buttonAddActivity: {
    backgroundColor: 'rgba(82,172,99,1)'
  },
  buttonStartDataCollection: {
    flexDirection: 'row',
    padding: 10,
    color: 'white',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    borderRadius: 5,
    backgroundColor: 'rgba(82,166,172,1)'
  },
  buttonStartDataCollectionDisabled: {
    opacity: 0.5,
    flexDirection: 'row',
    padding: 10,
    color: 'white',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    borderRadius: 5,
    backgroundColor: 'rgba(82,166,172,1)'
  }
});
