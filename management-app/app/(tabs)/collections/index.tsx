import { Feather, Ionicons } from '@expo/vector-icons';
import { SafeAreaView, StyleSheet, View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import stylesGlobal from '../../../styles/global';
import { useCallback, useState } from 'react';
import { deleteColeta, getColetas } from '@/data/database';
import { useFocusEffect } from 'expo-router';
import ModalDelete from '@/components/ModalDelete';
import Cores from '@/styles/cores';

export default function CollectionScreen() {
  const [listColetas, setListColetas] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useFocusEffect(
    useCallback(() => {
      carregarColetas();
    }, [])
  );

  const carregarColetas = async () => {
    getColetas().then((coletas) => {
      setListColetas(coletas);
      setLoading(false);
    });
  }

  const [modalDeleteColetaVisible, setModalDeleteColetaVisible] = useState(false);
  const [coletaToDeleteId, setColetaToDeleteId] = useState<number>(0);

  const handleDeleteColeta = async (id: number) => {
    setModalDeleteColetaVisible(false);
    setListColetas((prev) => {
      let indexToDelete = prev.findIndex(x => x.id === id);
      prev.splice(indexToDelete, 1);
      return prev;
    });
    console.log(id)
    await deleteColeta(id);
  };

  const excluirColeta = (id: number) => {
    setColetaToDeleteId(id);
    setModalDeleteColetaVisible(true);
  }

  const criarCardColeta = (item: any) => {
    return (
      <View style={stylesGlobal.card}>
        <View style={stylesCollections.containerNamecard}>
          <View style={{ width: '85%' }}>
            <Text style={stylesCollections.nameCard}>{item.nomeUsuario}</Text>
            <Text>{item.idadeUsuario} anos</Text>
            <Text>{item.nomeAtividade}</Text>
          </View>
          <TouchableOpacity onPress={() => excluirColeta(item.id)} style={{ padding: 5 }}>
            <Feather name='trash' color={Cores.cinza} size={20}></Feather>
          </TouchableOpacity>
        </View>
        {
          item.conexaoEstabelecida ?
            <>
              <Text style={[stylesGlobal.subtitleText, { color: Cores.verde }]}>
                Conexão estabelecida com sucesso
              </Text>
              <View style={stylesCollections.containerDateTime}>
                <View style={stylesCollections.containerTextDateTime}>
                  <Ionicons name='calendar-clear-outline' size={14}></Ionicons>
                  <Text>{(new Date(Number(item.horaInicio)).toLocaleDateString('pt-Br'))}</Text>
                </View>
                <View style={stylesCollections.containerTextDateTime}>
                  <Ionicons name='timer-outline' size={14}></Ionicons>
                  <Text>{Math.floor((Number(item.horaFim) - Number(item.horaInicio)) / 1000)} Segundo(s)</Text>
                </View>
              </View>
            </>
            : <Text style={[stylesGlobal.subtitleText, { color: Cores.vermelho }]}>
              Conexão não estabelecida
            </Text>
        }
      </View>
    );
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
    <SafeAreaView style={stylesGlobal.mainContainer}>
      <View style={stylesGlobal.pageTitleContainer}>
        <View>
          <Text style={stylesGlobal.pageTitle}>Historico de coletas</Text>
          <Text style={stylesGlobal.subtitleText}>Visualize sessões anteriores</Text>
        </View>
      </View>
      <FlatList
        contentContainerStyle={{ padding: 5 }}
        data={listColetas}
        renderItem={({ item }) => criarCardColeta(item)}
        keyExtractor={(item, index) => index.toString()}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={{ height: 10 }}></View>}
      ></FlatList>
      <ModalDelete
        visible={modalDeleteColetaVisible}
        setVisible={setModalDeleteColetaVisible}
        handleDelete={async () => await handleDeleteColeta(coletaToDeleteId)} />
    </SafeAreaView>
  );
}

const stylesCollections = StyleSheet.create({
  containerNamecard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  nameCard: {
    fontWeight: 'bold',
    fontSize: 16
  },
  containerDateTime: {
    flexDirection: 'row',
    gap: 7,
    marginVertical: 10
  },
  containerTextDateTime: {
    flexDirection: 'row',
    gap: 3,
    alignItems: 'center'
  },
  containerCardsRelatorio: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  cardRelatorio: {
    borderRadius: 5,
    width: '100%',
    paddingVertical: 5,
    justifyContent: 'center',
    alignItems: 'center'
  },
  labelCardRelatorio: {
    opacity: 0.5,
    fontSize: 12
  },
  cardRelatorioTempo: {
    backgroundColor: Cores.verdeClaro
  },
  cardRelatorioRegistros: {
    backgroundColor: Cores.azulClaro
  },
  cardRelatorioExemplo: {
    backgroundColor: Cores.vermelhoClaro
  }
})
