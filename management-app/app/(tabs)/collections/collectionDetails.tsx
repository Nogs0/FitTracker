import { Feather, Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Keyboard, KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, StyleSheet, TouchableOpacity, TouchableWithoutFeedback, View, Text } from 'react-native';
import stylesGlobal from '../../styles/global';

export default function CollectionDetailsScreen() {
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
                <Text style={stylesGlobal.pageTitle}>Detalhes da coleta</Text>
                <Text style={stylesGlobal.subtitleText}>Joãozinho gameplays - caminhada</Text>
              </View>
            </View>
            <View style={stylesGlobal.card}>
              <View style={stylesCollectionDetails.containerNamecard}>
                <Feather name='trending-up' size={20} color={'red'}></Feather>
                <Text style={stylesCollectionDetails.nameCard}>Resumo da sessão</Text>
              </View>
              <View style={stylesCollectionDetails.containerDateTime}>
                <View style={stylesCollectionDetails.containerTextDateTime}>
                  <Ionicons name='calendar-clear-outline' size={14}></Ionicons>
                  <Text>19/08/2025</Text>
                </View>
                <View style={stylesCollectionDetails.containerTextDateTime}>
                  <Ionicons name='stopwatch-outline' size={14}></Ionicons>
                  <Text>01:00</Text>
                </View>
              </View>
              <View style={stylesCollectionDetails.containerCardsRelatorio}>
                <View style={[stylesCollectionDetails.cardRelatorio, stylesCollectionDetails.cardRelatorioRegistros]}>
                  <Text>50</Text>
                  <Text style={stylesCollectionDetails.labelCardRelatorio}>Registros</Text>
                </View>
                <View style={[stylesCollectionDetails.cardRelatorio, stylesCollectionDetails.cardRelatorioTempo]}>
                  <Text>50s</Text>
                  <Text style={stylesCollectionDetails.labelCardRelatorio}>Segundos</Text>
                </View>
                <View style={[stylesCollectionDetails.cardRelatorio, stylesCollectionDetails.cardRelatorioExemplo]}>
                  <Text>50</Text>
                  <Text style={stylesCollectionDetails.labelCardRelatorio}>Pulsos</Text>
                </View>
              </View>
            </View>
          </SafeAreaView>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const stylesCollectionDetails = StyleSheet.create({
  containerNamecard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5
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
    width: '30%',
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
