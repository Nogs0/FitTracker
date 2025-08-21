import { Feather, Ionicons } from '@expo/vector-icons';
import { SafeAreaView, StyleSheet, View, Text, FlatList, TouchableOpacity } from 'react-native';
import stylesGlobal from '../../../styles/global';
import { useCallback, useState } from 'react';
import { deleteColeta, getColetas } from '@/data/database';
import { useFocusEffect } from 'expo-router';
import ModalDelete from '@/components/ModalDelete';

export default function CollectionScreen() {
  const [listColetas, setListColetas] = useState<any[]>([]);

  useFocusEffect(
    useCallback(() => {
      carregarColetas();
    }, [])
  );

  const carregarColetas = async () => {
    const coletas = await getColetas();
    setListColetas(coletas);
  }

  const [modalDeleteColetaVisible, setModalDeleteColetaVisible] = useState(false);
  const [coletaToDeleteId, setColetaToDeleteId] = useState<number>(0);

  const handleDeleteColeta = async (id: number) => {
    setModalDeleteColetaVisible(false);
    await deleteColeta(id);
    setListColetas([]);
    await carregarColetas();
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
          </View>
          <TouchableOpacity onPress={() => excluirColeta(item.id)} style={{ padding: 5 }}>
            <Feather name='trash' color={'gray'} size={20}></Feather>
          </TouchableOpacity>
        </View>
        <Text style={[stylesGlobal.subtitleText,
        (item.conexaoEstabelecida ? { color: 'green' } : { color: 'red' })]}>{item.conexaoEstabelecida ? 'Conexão estabelecida com sucesso' : 'Conexão não estabelecida'}</Text>
        <View style={stylesCollections.containerDateTime}>
          <View style={stylesCollections.containerTextDateTime}>
            <Ionicons name='calendar-clear-outline' size={14}></Ionicons>
            <Text>{(new Date(Number(item.horaInicio)).toLocaleDateString('pt-Br'))}</Text>
          </View>
        </View>
        <View style={stylesCollections.containerCardsRelatorio}>
          <View style={[stylesCollections.cardRelatorio, stylesCollections.cardRelatorioRegistros]}>
            <Text>{item.qtdDadosRecebidos ?? 0}</Text>
            <Text style={stylesCollections.labelCardRelatorio}>Registros</Text>
          </View>
          <View style={[stylesCollections.cardRelatorio, stylesCollections.cardRelatorioTempo]}>
            <Text>{Math.floor((Number(item.horaFim) - Number(item.horaInicio)) / 1000)}s</Text>
            <Text style={stylesCollections.labelCardRelatorio}>Segundos</Text>
          </View>
        </View>
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
    width: '48%',
    paddingVertical: 5,
    justifyContent: 'center',
    alignItems: 'center'
  },
  labelCardRelatorio: {
    opacity: 0.5,
    fontSize: 12
  },
  cardRelatorioTempo: {
    backgroundColor: 'rgb(200, 255, 214)'
  },
  cardRelatorioRegistros: {
    backgroundColor: 'rgb(231, 247, 255)'
  },
  cardRelatorioExemplo: {
    backgroundColor: 'rgb(255, 231, 231)'
  }
})
