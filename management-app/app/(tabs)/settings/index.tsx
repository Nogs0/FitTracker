import Collapsible from 'react-native-collapsible';
import { Feather } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View, SafeAreaView, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard, ToastAndroid, Alert } from 'react-native';
import stylesGlobal from '@/styles/global';
import { useRouter } from 'expo-router';
import { insertUsuario, getUsuarios, deleteUsuario, insertAtividade, getAtividades, deleteAtividade } from '@/data/database';
import ModalDelete from '@/components/ModalDelete';
import Cores from '@/styles/cores';

export default function SettingsScreen() {
  const router = useRouter();

  useEffect(() => {
    carregarUsuarios();
    carregarAtividades();
  }, [])

  const [modalDeleteUsuarioVisible, setModalDeleteUsuarioVisible] = useState(false);
  const [usuarioToDeleteId, setUsuarioToDeleteId] = useState<number>(0);
  const handleDeleteUsuario = async (id: number) => {
    setModalDeleteUsuarioVisible(false);
    await deleteUsuario(id);
    await carregarUsuarios();
  };

  const [modalDeleteAtividadeVisible, setModalDeleteAtividadeVisible] = useState(false);
  const [atividadeToDeleteId, setAtividadeToDeleteId] = useState<number>(0);

  const handleDeleteAtividade = async (id: number) => {
    setModalDeleteAtividadeVisible(false);
    await deleteAtividade(id);
    await carregarAtividades();
  };

  const [collapsedUsuarios, setCollapsedUsuarios] = useState(true);
  const [collapsedAtividades, setCollapsedAtividades] = useState(true);

  const toggleExpandedUsuarios = () => {
    setCollapsedUsuarios(!collapsedUsuarios);
  };

  const toggleExpandedAtividades = () => {
    setCollapsedAtividades(!collapsedAtividades);
  };

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
    setUsuarioToDeleteId(id);
    setModalDeleteUsuarioVisible(true);
  };

  // 🔹 Criar card do usuário
  const createCardUsuario = (item: any) => {
    return (
      <View key={item.id} style={stylesGlobal.cardList}>
        <View style={{ width: '80%' }}>
          <Text>{item.nome}</Text>
          <Text>{item.idade} anos</Text>
        </View>
        <TouchableOpacity onPress={() => excluirUsuario(item.id)} style={{ padding: 5 }}>
          <Feather name='trash' color={Cores.cinza} size={20} />
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
    setAtividadeToDeleteId(id);
    setModalDeleteAtividadeVisible(true);
  };


  const createCardAtividade = (item: any) => {
    return (
      <View key={item.id} style={stylesGlobal.cardList}>
        <Text style={{ width: '80%' }}>{item.nome}</Text>
        <TouchableOpacity onPress={() => excluirAtividade(item.id)} style={{ padding: 5 }}>
          <Feather name='trash' color={Cores.cinza} size={20}></Feather>
        </TouchableOpacity>
      </View>
    )
  }

  const navegarParaIniciarColeta = () => {
    if (listaDeAtividades.length === 0 || listaDeUsuarios.length === 0)
    {
      Alert.alert("Atenção", "Você deve criar ao menos um usuário e uma atividade");
      return;
    }
    router.push('/settings/startCollection');
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={"height"}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled">
          <SafeAreaView style={[stylesGlobal.mainContainer, {justifyContent: 'space-between'}]}>
            <View>
              <Text style={stylesGlobal.pageTitle}>Configurações da coleta</Text>
              <Text style={stylesGlobal.subtitleText}>Cadastre usuários e atividades físicas</Text>
            </View>
            <View style={stylesGlobal.card}>
              <View style={stylesGlobal.titleContainer}>
                <Feather name='users' size={25} color={Cores.azul} />
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
              <TouchableOpacity style={[stylesGlobal.button, stylesSettings.buttonAddUser,
              (!nomeUsuario || !idadeUsuario ? stylesGlobal.buttonDisabled : {})
              ]}
                onPress={addUsuario}
                disabled={!nomeUsuario || !idadeUsuario}>
                <Feather name='plus' size={25} color={Cores.branco} />
                <Text style={stylesGlobal.buttonLabel}>Adicionar usuário</Text>
              </TouchableOpacity>
              <View style={stylesGlobal.containerList}>
                {listaDeUsuarios.length > 0 ?
                  <TouchableOpacity style={stylesSettings.buttonCollapseList} onPress={toggleExpandedUsuarios}>
                    <Text style={stylesGlobal.labelList}>Usuários cadastrados ({listaDeUsuarios.length})</Text>
                    <Feather name={collapsedUsuarios ? 'chevron-down' : 'chevron-up'} color={Cores.cinza} size={20}></Feather>
                  </TouchableOpacity>
                  : <></>}
                <Collapsible collapsed={collapsedUsuarios}>
                  {listaDeUsuarios.map((user, i) => createCardUsuario(user))}
                </Collapsible>
              </View>
            </View>
            <View style={stylesGlobal.card}>
              <View style={stylesGlobal.titleContainer}>
                <Feather name='activity' size={25} color={Cores.verde} />
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
              <TouchableOpacity style={[stylesGlobal.button, stylesSettings.buttonAddActivity,
              (!nomeAtividade ? stylesGlobal.buttonDisabled : {})
              ]}
                onPress={addAtividade}
                disabled={!nomeAtividade}>
                <Feather name='plus' size={25} color={Cores.branco} />
                <Text style={stylesGlobal.buttonLabel}>Adicionar atividade</Text>
              </TouchableOpacity>
              <View style={stylesGlobal.containerList}>
                {listaDeAtividades.length > 0 ?
                  <TouchableOpacity style={stylesSettings.buttonCollapseList} onPress={toggleExpandedAtividades}>
                    <Text style={stylesGlobal.labelList}>Atividades cadastradas ({listaDeAtividades.length})</Text>
                    <Feather name={collapsedAtividades ? 'chevron-down' : 'chevron-up'} color={Cores.cinza} size={20}></Feather>
                  </TouchableOpacity>
                  : <></>}
                <Collapsible collapsed={collapsedAtividades}>
                  {listaDeAtividades.map((atividade, i) => createCardAtividade(atividade))}
                </Collapsible>
              </View>
            </View>
            <TouchableOpacity
              style={stylesSettings.buttonStartDataCollection}
              onPress={navegarParaIniciarColeta}>
              <Text style={[stylesGlobal.buttonLabel, stylesSettings.buttonLabelStartDataCollection,]}>Iniciar coleta de dados</Text>
              <Feather name='arrow-right' size={30} color={Cores.branco} />
            </TouchableOpacity>
          </SafeAreaView>
        </ScrollView>
      </TouchableWithoutFeedback>
      <ModalDelete
        visible={modalDeleteUsuarioVisible}
        setVisible={setModalDeleteUsuarioVisible}
        handleDelete={async () => await handleDeleteUsuario(usuarioToDeleteId)} />
      <ModalDelete
        visible={modalDeleteAtividadeVisible}
        setVisible={setModalDeleteAtividadeVisible}
        handleDelete={async() => await handleDeleteAtividade(atividadeToDeleteId)} />
    </KeyboardAvoidingView>
  );
}

const stylesSettings = StyleSheet.create({
  buttonLabelStartDataCollection: {
    fontSize: 20
  },
  buttonAddUser: {
    backgroundColor: Cores.azul
  },
  buttonAddActivity: {
    backgroundColor: Cores.verde
  },
  buttonStartDataCollection: {
    flexDirection: 'row',
    padding: 10,
    alignItems: 'center',
    justifyContent: 'space-evenly',
    borderRadius: 5,
    backgroundColor: Cores.ciano
  },
  buttonCollapseList: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  }
});
